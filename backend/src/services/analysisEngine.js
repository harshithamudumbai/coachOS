function runDeterministicAnalysis({ query, parsedExplain }) {
  const q = query.toLowerCase();
  
  const findings = [];
  let score = 100;

  // 1. SELECT *
  if (q.includes('select *')) {
    findings.push({
      rule: 'SELECT_STAR',
      severity: 'Low',
      impact: 'Over-fetching, increased network transfer, prevents some covering-index opportunities',
      recommendation: 'Select only required columns',
      evidence: 'Query contains "SELECT *"'
    });
    score -= 5;
  }

  // 2. Full Table Scan
  if (parsedExplain?.fullTableScans > 0) {
    findings.push({
      rule: 'FULL_TABLE_SCAN',
      severity: 'High',
      impact: 'Entire table scanned',
      recommendation: 'Investigate missing indexes, check WHERE clause selectivity',
      evidence: `Found ${parsedExplain.fullTableScans} tables with accessType="ALL" (Tables: ${parsedExplain.missingIndexHints.join(', ')})`
    });
    score -= 25;
  }

  // 3. Filesort
  if (parsedExplain?.usingFilesort) {
    findings.push({
      rule: 'FILESORT',
      severity: 'High',
      impact: 'Additional sorting operation',
      recommendation: 'Create index matching WHERE + ORDER BY sequence',
      evidence: 'EXPLAIN indicated "using_filesort: true"'
    });
    score -= 15;
  }

  // 4. Temporary Table
  if (parsedExplain?.usingTemporaryTable) {
    findings.push({
      rule: 'TEMPORARY_TABLE',
      severity: 'High',
      impact: 'Increased memory and disk usage',
      recommendation: 'Simplify grouping, add supporting indexes',
      evidence: 'EXPLAIN indicated "using_temporary_table: true"'
    });
    score -= 15;
  }

  // 5. Large Row Examination
  if (parsedExplain?.totalRowsExamined > 100000) {
    findings.push({
      rule: 'LARGE_ROW_EXAMINATION',
      severity: 'Medium',
      impact: 'Excessive data scanning',
      recommendation: 'Improve filtering indexes',
      evidence: `Total rows examined per scan estimated at ${parsedExplain.totalRowsExamined}`
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
          rule: 'HUGE_IN_CLAUSE',
          severity: 'High',
          impact: 'Optimizer degradation, larger parsing cost',
          recommendation: 'Load IDs into temporary table, join against temp table',
          evidence: `IN clause contains ${commas + 1} values`
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
      rule: 'MISSING_COMPOSITE_INDEX',
      severity: 'High',
      impact: 'Multiple index lookups or larger row scans',
      recommendation: 'Create composite index matching filter order',
      evidence: 'Query uses multiple AND conditions but EXPLAIN shows a full table scan'
    });
    score -= 15;
  }

  // 8. Function on Indexed Column
  // simplistic regex to catch things like DATE(col) = or LOWER(col) =
  const funcMatch = q.match(/where\s+([\w]+)\([\w]+\)\s*[=<>]/i);
  if (funcMatch) {
    findings.push({
      rule: 'FUNCTION_ON_INDEXED_COLUMN',
      severity: 'High',
      impact: 'Index becomes unusable',
      recommendation: 'Rewrite predicate to avoid functions on columns',
      evidence: `Detected function ${funcMatch[1]}() in WHERE clause`
    });
    score -= 15;
  }

  // 9. OR Condition Explosion
  const orMatches = q.match(/\bor\b/g);
  if (orMatches && orMatches.length > 2) {
    findings.push({
      rule: 'OR_CONDITION_EXPLOSION',
      severity: 'Medium',
      impact: 'Poor index utilization',
      recommendation: 'Evaluate UNION ALL strategy',
      evidence: `Detected ${orMatches.length} OR conditions`
    });
  }

  // 10. Pagination Risk
  const limitMatch = q.match(/limit\s+(\d+)\s*(?:,\s*\d+)?/i);
  if (limitMatch && parseInt(limitMatch[1], 10) > 5000) {
    findings.push({
      rule: 'PAGINATION_RISK',
      severity: 'Medium',
      impact: 'Deep pagination cost',
      recommendation: 'Use Keyset pagination',
      evidence: `Detected large OFFSET: ${limitMatch[1]}`
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
