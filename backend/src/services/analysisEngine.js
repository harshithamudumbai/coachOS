function runDeterministicAnalysis({ query, parsedExplain }) {
  const q = query.toLowerCase();
  
  const findings = [];
  let score = 100;

  // 1. SELECT *
  if (q.includes('select *')) {
    findings.push({
      rule: 'SELECT *',
      severity: 'Low',
      impact: 'Over-fetching, increased network transfer, prevents some covering-index opportunities',
      recommendation: 'Select only required columns'
    });
    score -= 5;
  }

  // 2. Full Table Scan
  if (parsedExplain?.fullTableScans > 0) {
    findings.push({
      rule: 'Full Table Scan',
      severity: 'High',
      impact: 'Entire table scanned',
      recommendation: 'Investigate missing indexes, check WHERE clause selectivity'
    });
    score -= 25;
  }

  // 3. Filesort
  if (parsedExplain?.usingFilesort) {
    findings.push({
      rule: 'Filesort',
      severity: 'High',
      impact: 'Additional sorting operation',
      recommendation: 'Create index matching WHERE + ORDER BY sequence'
    });
    score -= 15;
  }

  // 4. Temporary Table
  if (parsedExplain?.usingTemporaryTable) {
    findings.push({
      rule: 'Temporary Table',
      severity: 'High',
      impact: 'Increased memory and disk usage',
      recommendation: 'Simplify grouping, add supporting indexes'
    });
    score -= 15;
  }

  // 5. Large Row Examination
  if (parsedExplain?.totalRowsExamined > 100000) {
    findings.push({
      rule: 'Large Row Examination',
      severity: 'Medium',
      impact: 'Excessive data scanning',
      recommendation: 'Improve filtering indexes'
    });
    score -= 10;
  }

  // 6. Huge IN Clause
  const inMatches = q.match(/in\s*\(([^)]+)\)/g);
  if (inMatches) {
    for (const match of inMatches) {
      const commas = (match.match(/,/g) || []).length;
      if (commas > 100) {
        findings.push({
          rule: 'Huge IN Clause',
          severity: 'High',
          impact: 'Optimizer degradation, larger parsing cost',
          recommendation: 'Load IDs into temporary table, join against temp table'
        });
        score -= 10;
        break; // Only deduct once
      }
    }
  }

  // 7. Missing Composite Index Heuristic
  // Simple check: multiple WHERE clauses and ALL scan
  if (q.includes('where') && q.includes('and') && parsedExplain?.fullTableScans > 0) {
    findings.push({
      rule: 'Missing Composite Index',
      severity: 'High',
      impact: 'Multiple index lookups or larger row scans',
      recommendation: 'Create composite index matching filter order'
    });
    score -= 15;
  }

  // 8. Function on Indexed Column
  // simplistic regex to catch things like DATE(col) = or LOWER(col) =
  if (/where\s+[\w]+\([\w]+\)\s*[=<>]/i.test(q)) {
    findings.push({
      rule: 'Function on Indexed Column',
      severity: 'High',
      impact: 'Index becomes unusable',
      recommendation: 'Rewrite predicate to avoid functions on columns'
    });
    score -= 15;
  }

  // 9. OR Condition Explosion
  const orMatches = q.match(/\bor\b/g);
  if (orMatches && orMatches.length > 2) {
    findings.push({
      rule: 'OR Condition Explosion',
      severity: 'Medium',
      impact: 'Poor index utilization',
      recommendation: 'Evaluate UNION ALL strategy'
    });
  }

  // 10. Pagination Risk
  const limitMatch = q.match(/limit\s+(\d+)\s*(?:,\s*\d+)?/i);
  if (limitMatch && parseInt(limitMatch[1], 10) > 5000) {
    findings.push({
      rule: 'Pagination Risk',
      severity: 'Medium',
      impact: 'Deep pagination cost',
      recommendation: 'Use Keyset pagination'
    });
    score -= 5;
  }

  // Clamp score
  if (score < 0) score = 0;

  // Severity Mapping
  let severityLevel = 'Critical';
  if (score >= 90) severityLevel = 'Excellent';
  else if (score >= 75) severityLevel = 'Good';
  else if (score >= 50) severityLevel = 'Needs Optimization';
  else if (score >= 25) severityLevel = 'Poor';

  return {
    healthScore: score,
    severity: severityLevel,
    detectedIssues: findings
  };
}

module.exports = { runDeterministicAnalysis };
