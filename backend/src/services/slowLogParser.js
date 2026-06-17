function fingerprintQuery(query) {
  let fp = query.replace(/--.*$/gm, ''); // remove single line comments
  fp = fp.replace(/\/\*[\s\S]*?\*\//g, ''); // remove multi line comments
  fp = fp.replace(/\s+/g, ' ').trim(); // normalize whitespace
  fp = fp.toLowerCase();

  // Replace quoted strings with ?
  fp = fp.replace(/'[^']*'/g, '?');
  fp = fp.replace(/"[^"]*"/g, '?');

  // Replace numbers with ?
  fp = fp.replace(/\b\d+\b/g, '?');

  // Replace multiple IN (?,?,?) with IN (?)
  fp = fp.replace(/in\s*\(\s*(\?\s*,\s*)*\?\s*\)/gi, 'in (?)');

  return fp;
}

function parseSlowLog(logContent) {
  const lines = logContent.split('\n');
  const queries = [];
  
  let currentMetrics = null;
  let currentQueryLines = [];
  let inQuery = false;

  for (let line of lines) {
    if (line.startsWith('# Time:')) {
      // New query block might start
      if (inQuery && currentQueryLines.length > 0) {
        queries.push({ metrics: currentMetrics, query: currentQueryLines.join('\n').trim() });
        currentQueryLines = [];
      }
      inQuery = false;
      continue;
    }

    if (line.startsWith('# User@Host:')) {
      if (inQuery && currentQueryLines.length > 0) {
        queries.push({ metrics: currentMetrics, query: currentQueryLines.join('\n').trim() });
        currentQueryLines = [];
      }
      inQuery = false;
      continue;
    }

    if (line.startsWith('# Query_time:')) {
      // Parse metrics
      // # Query_time: 2.100000  Lock_time: 0.000000 Rows_sent: 10  Rows_examined: 1500000
      const queryTimeMatch = line.match(/Query_time:\s*([\d.]+)/);
      const rowsExaminedMatch = line.match(/Rows_examined:\s*(\d+)/);
      
      currentMetrics = {
        queryTime: queryTimeMatch ? parseFloat(queryTimeMatch[1]) : 0,
        rowsExamined: rowsExaminedMatch ? parseInt(rowsExaminedMatch[1], 10) : 0
      };
      inQuery = true;
      continue;
    }

    if (inQuery) {
      // Ignore SET timestamp lines or USE db lines
      if (line.startsWith('SET timestamp=') || line.startsWith('use ')) {
        continue;
      }
      if (line.trim().length > 0 && !line.startsWith('#')) {
        currentQueryLines.push(line);
      }
    }
  }

  // push last query
  if (inQuery && currentQueryLines.length > 0) {
    queries.push({ metrics: currentMetrics, query: currentQueryLines.join('\n').trim() });
  }

  // Aggregate by fingerprint
  const aggregated = {};

  for (const q of queries) {
    if (!q.query) continue;
    const fp = fingerprintQuery(q.query);
    
    if (!aggregated[fp]) {
      aggregated[fp] = {
        fingerprint: fp,
        exampleQuery: q.query,
        count: 0,
        totalTime: 0,
        maxTime: 0,
        totalRowsExamined: 0
      };
    }
    
    aggregated[fp].count += 1;
    aggregated[fp].totalTime += q.metrics?.queryTime || 0;
    aggregated[fp].totalRowsExamined += q.metrics?.rowsExamined || 0;
    
    if (q.metrics?.queryTime > aggregated[fp].maxTime) {
      aggregated[fp].maxTime = q.metrics.queryTime;
      aggregated[fp].exampleQuery = q.query; // Keep the worst query as example
    }
  }

  const resultList = Object.values(aggregated).sort((a, b) => b.totalTime - a.totalTime);
  return resultList;
}

module.exports = { parseSlowLog, fingerprintQuery };
