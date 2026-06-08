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

const ENGINE_VERSION = "1.0";

const RULE_REGISTRY = {
  SELECT_STAR: { category: "Query Anti-Pattern", severity: "Low", confidence: 100 },
  FULL_TABLE_SCAN: { category: "Execution Plan", severity: "High", confidence: 100 },
  FILESORT: { category: "Execution Plan", severity: "High", confidence: 100 },
  TEMPORARY_TABLE: { category: "Execution Plan", severity: "High", confidence: 100 },
  LARGE_ROW_EXAMINATION: { category: "Execution Plan", severity: "Medium", confidence: 90 },
  HUGE_IN_CLAUSE: { category: "Query Anti-Pattern", severity: "High", confidence: 100 },
  MISSING_COMPOSITE_INDEX: { category: "Indexing Strategy", severity: "High", confidence: 75 },
  FUNCTION_ON_INDEXED_COLUMN: { category: "Query Anti-Pattern", severity: "High", confidence: 85 },
  OR_CONDITION_EXPLOSION: { category: "Query Anti-Pattern", severity: "Medium", confidence: 80 },
  PAGINATION_RISK: { category: "Architecture", severity: "Medium", confidence: 95 },
  INDEX_REDUNDANCY: { category: "Indexing Strategy", severity: "Medium", confidence: 100 }
};

function runDeterministicAnalysis({ query, parsedExplain, indexes }) {
  const q = query.toLowerCase();
  
  const findings = [];
  const executedRules = Object.keys(RULE_REGISTRY);
  const triggeredRules = [];
  let score = 100;

  function triggerRule(code, impact, recommendation, evidence) {
    triggeredRules.push(code);
    findings.push({
      rule: code,
      severity: RULE_REGISTRY[code].severity,
      confidence: RULE_REGISTRY[code].confidence,
      impact,
      recommendation,
      evidence
    });
  }

  // 1. SELECT *
  if (q.includes('select *')) {
    triggerRule('SELECT_STAR', 'Over-fetching, increased network transfer, prevents some covering-index opportunities', 'Select only required columns', 'Query contains "SELECT *"');
    score -= 5;
  }

  // 2. Full Table Scan
  if (parsedExplain?.fullTableScans > 0) {
    triggerRule('FULL_TABLE_SCAN', 'Entire table scanned', 'Investigate missing indexes, check WHERE clause selectivity', `Found ${parsedExplain.fullTableScans} tables with accessType="ALL" (Tables: ${parsedExplain.missingIndexHints.join(', ')})`);
    score -= 25;
  }

  // 3. Filesort
  if (parsedExplain?.usingFilesort) {
    triggerRule('FILESORT', 'Additional sorting operation', 'Create index matching WHERE + ORDER BY sequence', 'EXPLAIN indicated "using_filesort: true"');
    score -= 15;
  }

  // 4. Temporary Table
  if (parsedExplain?.usingTemporaryTable) {
    triggerRule('TEMPORARY_TABLE', 'Increased memory and disk usage', 'Simplify grouping, add supporting indexes', 'EXPLAIN indicated "using_temporary_table: true"');
    score -= 15;
  }

  // 5. Large Row Examination
  if (parsedExplain?.totalRowsExamined > 100000) {
    triggerRule('LARGE_ROW_EXAMINATION', 'Excessive data scanning', 'Improve filtering indexes', `Total rows examined per scan estimated at ${parsedExplain.totalRowsExamined}`);
    score -= 10;
  }

  // 6. Huge IN Clause
  const inMatches = q.match(/in\s*\(([^)]+)\)/g);
  if (inMatches) {
    for (const match of inMatches) {
      const commas = (match.match(/,/g) || []).length;
      if (commas > 100) {
        triggerRule('HUGE_IN_CLAUSE', 'Optimizer degradation, larger parsing cost', 'Load IDs into temporary table, join against temp table', `IN clause contains ${commas + 1} values`);
        score -= 10;
        break; // Only deduct once
      }
    }
  }

  // 7. Missing Composite Index Heuristic
  if (q.includes('where') && q.includes('and') && parsedExplain?.fullTableScans > 0) {
    triggerRule('MISSING_COMPOSITE_INDEX', 'Multiple index lookups or larger row scans', 'Create composite index matching filter order', 'Query uses multiple AND conditions but EXPLAIN shows a full table scan');
    score -= 15;
  }

  // 8. Function on Indexed Column
  const funcMatch = q.match(/where\s+([\w]+)\([\w]+\)\s*[=<>]/i);
  if (funcMatch) {
    triggerRule('FUNCTION_ON_INDEXED_COLUMN', 'Index becomes unusable', 'Rewrite predicate to avoid functions on columns', `Detected function ${funcMatch[1]}() in WHERE clause`);
    score -= 15;
  }

  // 9. OR Condition Explosion
  const orMatches = q.match(/\bor\b/g);
  if (orMatches && orMatches.length > 2) {
    triggerRule('OR_CONDITION_EXPLOSION', 'Poor index utilization', 'Evaluate UNION ALL strategy', `Detected ${orMatches.length} OR conditions`);
  }

  // 10. Pagination Risk
  const limitMatch = q.match(/limit\s+(\d+)\s*(?:,\s*\d+)?/i);
  if (limitMatch && parseInt(limitMatch[1], 10) > 5000) {
    triggerRule('PAGINATION_RISK', 'Deep pagination cost', 'Use Keyset pagination', `Detected large OFFSET: ${limitMatch[1]}`);
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
        
        if (idxA.cols.length > 0 && idxB.cols.length > idxA.cols.length) {
          let isPrefix = true;
          for (let k = 0; k < idxA.cols.length; k++) {
            if (idxA.cols[k] !== idxB.cols[k]) {
              isPrefix = false;
              break;
            }
          }
          if (isPrefix) {
            triggerRule('INDEX_REDUNDANCY', 'Unnecessary write overhead during INSERT/UPDATE/DELETE', `Drop index ${idxA.name} as it is fully covered by ${idxB.name}`, `Index ${idxA.name}(${idxA.cols.join(',')}) is a strict left-prefix of ${idxB.name}(${idxB.cols.join(',')})`);
            break; 
          }
        }
      }
    }
  }

  if (score < 0) score = 0;

  let severityLevel = 'Critical';
  if (score >= 90) severityLevel = 'Excellent';
  else if (score >= 75) severityLevel = 'Good';
  else if (score >= 50) severityLevel = 'Needs Optimization';
  else if (score >= 25) severityLevel = 'Poor';

  const uniqueTriggeredRules = [...new Set(triggeredRules)];

  return {
    engineVersion: ENGINE_VERSION,
    healthScore: score,
    severity: severityLevel,
    executedRules: executedRules,
    triggeredRules: uniqueTriggeredRules,
    detectedIssues: findings
  };
}

module.exports = { runDeterministicAnalysis };
