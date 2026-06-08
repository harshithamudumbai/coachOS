function parseIndexes(indexesStr) {
  if (!indexesStr) return [];
  // Basic heuristic: look for "index_name (col1, col2)" patterns
  const regex = /(\w+)\s*\(([^)]+)\)/g;
  const indexes = [];
  let match;
  while ((match = regex.exec(indexesStr)) !== null) {
    const name = match[1];
    const cols = match[2].split(',').map(c => c.trim().replace(/['"`]/g, ''));
    indexes.push({ name, cols });
  }
  return indexes;
}

function runDeterministicAnalysis({ query, parsedExplain, indexes }) {
  const q = query.toLowerCase();
  
  const findings = [];
  const executedRules = [
    'SELECT_STAR', 'FULL_TABLE_SCAN', 'FILESORT', 'TEMPORARY_TABLE',
    'LARGE_ROW_EXAMINATION', 'HUGE_IN_CLAUSE', 'MISSING_COMPOSITE_INDEX',
    'FUNCTION_ON_INDEXED_COLUMN', 'OR_CONDITION_EXPLOSION', 'PAGINATION_RISK',
    'INDEX_REDUNDANCY'
  ];
  const triggeredRules = [];
  let score = 100;

  // 1. SELECT *
  if (q.includes('select *')) {
    triggeredRules.push('SELECT_STAR');
    findings.push({
      rule: 'SELECT_STAR',
      severity: 'Low',
      confidence: 100,
      impact: 'Over-fetching, increased network transfer, prevents some covering-index opportunities',
      recommendation: 'Select only required columns',
      evidence: 'Query contains "SELECT *"'
    });
    score -= 5;
  }

  // 2. Full Table Scan
  if (parsedExplain?.fullTableScans > 0) {
    triggeredRules.push('FULL_TABLE_SCAN');
    findings.push({
      rule: 'FULL_TABLE_SCAN',
      severity: 'High',
      confidence: 100,
      impact: 'Entire table scanned',
      recommendation: 'Investigate missing indexes, check WHERE clause selectivity',
      evidence: `Found ${parsedExplain.fullTableScans} tables with accessType="ALL" (Tables: ${parsedExplain.missingIndexHints.join(', ')})`
    });
    score -= 25;
  }

  // 3. Filesort
  if (parsedExplain?.usingFilesort) {
    triggeredRules.push('FILESORT');
    findings.push({
      rule: 'FILESORT',
      severity: 'High',
      confidence: 100,
      impact: 'Additional sorting operation',
      recommendation: 'Create index matching WHERE + ORDER BY sequence',
      evidence: 'EXPLAIN indicated "using_filesort: true"'
    });
    score -= 15;
  }

  // 4. Temporary Table
  if (parsedExplain?.usingTemporaryTable) {
    triggeredRules.push('TEMPORARY_TABLE');
    findings.push({
      rule: 'TEMPORARY_TABLE',
      severity: 'High',
      confidence: 100,
      impact: 'Increased memory and disk usage',
      recommendation: 'Simplify grouping, add supporting indexes',
      evidence: 'EXPLAIN indicated "using_temporary_table: true"'
    });
    score -= 15;
  }

  // 5. Large Row Examination
  if (parsedExplain?.totalRowsExamined > 100000) {
    triggeredRules.push('LARGE_ROW_EXAMINATION');
    findings.push({
      rule: 'LARGE_ROW_EXAMINATION',
      severity: 'Medium',
      confidence: 90,
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
        triggeredRules.push('HUGE_IN_CLAUSE');
        findings.push({
          rule: 'HUGE_IN_CLAUSE',
          severity: 'High',
          confidence: 100,
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
  if (q.includes('where') && q.includes('and') && parsedExplain?.fullTableScans > 0) {
    triggeredRules.push('MISSING_COMPOSITE_INDEX');
    findings.push({
      rule: 'MISSING_COMPOSITE_INDEX',
      severity: 'High',
      confidence: 75, // Heuristic-based
      impact: 'Multiple index lookups or larger row scans',
      recommendation: 'Create composite index matching filter order',
      evidence: 'Query uses multiple AND conditions but EXPLAIN shows a full table scan'
    });
    score -= 15;
  }

  // 8. Function on Indexed Column
  const funcMatch = q.match(/where\s+([\w]+)\([\w]+\)\s*[=<>]/i);
  if (funcMatch) {
    triggeredRules.push('FUNCTION_ON_INDEXED_COLUMN');
    findings.push({
      rule: 'FUNCTION_ON_INDEXED_COLUMN',
      severity: 'High',
      confidence: 85,
      impact: 'Index becomes unusable',
      recommendation: 'Rewrite predicate to avoid functions on columns',
      evidence: `Detected function ${funcMatch[1]}() in WHERE clause`
    });
    score -= 15;
  }

  // 9. OR Condition Explosion
  const orMatches = q.match(/\bor\b/g);
  if (orMatches && orMatches.length > 2) {
    triggeredRules.push('OR_CONDITION_EXPLOSION');
    findings.push({
      rule: 'OR_CONDITION_EXPLOSION',
      severity: 'Medium',
      confidence: 80,
      impact: 'Poor index utilization',
      recommendation: 'Evaluate UNION ALL strategy',
      evidence: `Detected ${orMatches.length} OR conditions`
    });
  }

  // 10. Pagination Risk
  const limitMatch = q.match(/limit\s+(\d+)\s*(?:,\s*\d+)?/i);
  if (limitMatch && parseInt(limitMatch[1], 10) > 5000) {
    triggeredRules.push('PAGINATION_RISK');
    findings.push({
      rule: 'PAGINATION_RISK',
      severity: 'Medium',
      confidence: 95,
      impact: 'Deep pagination cost',
      recommendation: 'Use Keyset pagination',
      evidence: `Detected large OFFSET: ${limitMatch[1]}`
    });
    score -= 5;
  }

  // 11. Index Redundancy
  if (indexes) {
    const parsedIdx = parseIndexes(indexes);
    for (let i = 0; i < parsedIdx.length; i++) {
      for (let j = 0; j < parsedIdx.length; j++) {
        if (i === j) continue;
        const idxA = parsedIdx[i];
        const idxB = parsedIdx[j];
        
        // If idxB covers all columns of idxA in the same order (idxA is a prefix of idxB)
        if (idxA.cols.length > 0 && idxB.cols.length > idxA.cols.length) {
          let isPrefix = true;
          for (let k = 0; k < idxA.cols.length; k++) {
            if (idxA.cols[k] !== idxB.cols[k]) {
              isPrefix = false;
              break;
            }
          }
          if (isPrefix) {
            triggeredRules.push('INDEX_REDUNDANCY');
            findings.push({
              rule: 'INDEX_REDUNDANCY',
              severity: 'Medium',
              confidence: 100,
              impact: 'Unnecessary write overhead during INSERT/UPDATE/DELETE',
              recommendation: `Drop index ${idxA.name} as it is fully covered by ${idxB.name}`,
              evidence: `Index ${idxA.name}(${idxA.cols.join(',')}) is a strict left-prefix of ${idxB.name}(${idxB.cols.join(',')})`
            });
            break; // Deduplicate warnings for the same index
          }
        }
      }
    }
  }

  // Clamp score
  if (score < 0) score = 0;

  let severityLevel = 'Critical';
  if (score >= 90) severityLevel = 'Excellent';
  else if (score >= 75) severityLevel = 'Good';
  else if (score >= 50) severityLevel = 'Needs Optimization';
  else if (score >= 25) severityLevel = 'Poor';

  // Deduplicate triggered rules in case a rule triggers multiple times
  const uniqueTriggeredRules = [...new Set(triggeredRules)];

  return {
    healthScore: score,
    severity: severityLevel,
    executedRules,
    triggeredRules: uniqueTriggeredRules,
    detectedIssues: findings
  };
}

module.exports = { runDeterministicAnalysis };
