function parseExplainOutput(explainJson) {
  if (!explainJson) return null;

  // If it's already an object, traverse it directly
  if (typeof explainJson === 'object') {
    return parseJsonExplain(explainJson);
  }

  // If it's a string, try JSON first
  try {
    const plan = JSON.parse(explainJson);
    return parseJsonExplain(plan);
  } catch (e) {
    // Not valid JSON. Let's see if it looks like textual EXPLAIN output.
    if (!isExplainText(explainJson)) {
      return null;
    }
    return parseTextExplain(explainJson);
  }
}

function isExplainText(str) {
  if (typeof str !== 'string') return false;
  const lower = str.toLowerCase();
  return (
    lower.includes('->') ||
    lower.includes('|') ||
    lower.includes('table scan') ||
    lower.includes('index scan') ||
    lower.includes('nested loop') ||
    lower.includes('filesort') ||
    lower.includes('temporary table') ||
    lower.includes('rows=')
  );
}

function parseJsonExplain(plan) {
  const result = {
    tables: [],
    fullTableScans: 0,
    totalRowsExamined: 0,
    missingIndexHints: [],
    usingFilesort: false,
    usingTemporaryTable: false
  };

  function traverseNode(node) {
    if (!node) return;

    if (node.using_filesort) result.usingFilesort = true;
    if (node.using_temporary_table) result.usingTemporaryTable = true;

    if (node.table_name) {
      const tableInfo = {
        table: node.table_name,
        accessType: node.access_type || 'unknown',
        rowsExamined: node.rows_examined_per_scan || 0,
        keyUsed: node.key || null,
        costInfo: node.cost_info || {},
        filtered: node.filtered || null
      };
      result.tables.push(tableInfo);
      result.totalRowsExamined += tableInfo.rowsExamined;

      if (tableInfo.accessType === 'ALL') {
        result.fullTableScans++;
        result.missingIndexHints.push(tableInfo.table);
      }
    }

    // Recurse into nested tables
    if (node.nested_loop) node.nested_loop.forEach(n => traverseNode(n.table));
    if (node.grouping_operation) traverseNode(node.grouping_operation);
    if (node.ordering_operation) traverseNode(node.ordering_operation);
    if (node.table) traverseNode(node.table);
  }

  traverseNode(plan?.query_block);
  return result;
}

function parseTextExplain(text) {
  const result = {
    tables: [],
    fullTableScans: 0,
    totalRowsExamined: 0,
    missingIndexHints: [],
    usingFilesort: false,
    usingTemporaryTable: false
  };

  const lines = text.split('\n');
  let headers = null;
  let tableIdx = -1, typeIdx = -1, rowsIdx = -1, extraIdx = -1;

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const lowerLine = trimmed.toLowerCase();

    // Check filesort / sorting anywhere
    if (
      lowerLine.includes('filesort') ||
      lowerLine.includes('sort:') ||
      lowerLine.includes('sort row ids') ||
      lowerLine.includes('ordering_operation')
    ) {
      result.usingFilesort = true;
    }

    // Check temporary table usage anywhere
    if (
      lowerLine.includes('temporary table') ||
      lowerLine.includes('<temporary>') ||
      lowerLine.includes('grouping_operation') ||
      lowerLine.includes('aggregate using')
    ) {
      result.usingTemporaryTable = true;
    }

    // Tabular format parsing (contains '|')
    if (trimmed.startsWith('|') || trimmed.includes('|')) {
      const fullParts = trimmed.split('|').map(p => p.trim());
      
      // Check for headers
      if (lowerLine.includes('id') && lowerLine.includes('select_type') && lowerLine.includes('table')) {
        headers = fullParts;
        tableIdx = headers.findIndex(h => h.toLowerCase() === 'table');
        typeIdx = headers.findIndex(h => h.toLowerCase() === 'type');
        rowsIdx = headers.findIndex(h => h.toLowerCase() === 'rows');
        extraIdx = headers.findIndex(h => h.toLowerCase() === 'extra');
        continue;
      }

      // Skip lines that are decorative (e.g. +----+-----+ or only hyphens/pluses)
      if (/^[+-]+$/.test(trimmed.replace(/\s/g, ''))) {
        continue;
      }

      let table = 'unknown';
      let accessType = 'unknown';
      let rows = 0;
      let extra = '';

      if (headers && tableIdx !== -1 && typeIdx !== -1) {
        table = fullParts[tableIdx] || 'unknown';
        accessType = fullParts[typeIdx] || 'unknown';
        if (rowsIdx !== -1) rows = parseInt(fullParts[rowsIdx], 10) || 0;
        if (extraIdx !== -1) extra = fullParts[extraIdx] || '';
      } else {
        // Guess columns based on typical access types
        const accessTypes = ['all', 'index', 'range', 'ref', 'eq_ref', 'const', 'system', 'index_merge'];
        let foundTypeIdx = -1;
        for (let idx = 0; idx < fullParts.length; idx++) {
          if (accessTypes.includes(fullParts[idx].toLowerCase())) {
            foundTypeIdx = idx;
            break;
          }
        }
        if (foundTypeIdx !== -1) {
          accessType = fullParts[foundTypeIdx];
          table = fullParts[foundTypeIdx - 2] || fullParts[foundTypeIdx - 1] || 'unknown';
          table = table.replace(/[`'"]/g, '');

          // find rows (numeric column after type)
          for (let idx = foundTypeIdx + 1; idx < fullParts.length; idx++) {
            if (/^\d+$/.test(fullParts[idx])) {
              rows = parseInt(fullParts[idx], 10);
              break;
            }
          }
          // find extra
          for (let idx = fullParts.length - 1; idx > foundTypeIdx; idx--) {
            if (fullParts[idx].toLowerCase().includes('using')) {
              extra = fullParts[idx];
              break;
            }
          }
        }
      }

      if (table !== 'unknown' && table !== 'table') {
        const tableInfo = {
          table,
          accessType,
          rowsExamined: rows
        };
        result.tables.push(tableInfo);
        result.totalRowsExamined += rows;

        if (accessType.toUpperCase() === 'ALL') {
          result.fullTableScans++;
          if (!result.missingIndexHints.includes(table)) {
            result.missingIndexHints.push(table);
          }
        }
        if (extra.toLowerCase().includes('filesort')) result.usingFilesort = true;
        if (extra.toLowerCase().includes('temporary')) result.usingTemporaryTable = true;
      }
    } else {
      // Tree/Analyze format parsing (e.g. lines with -> or Table scan/Index scan)
      // Example: -> Table scan on fch
      const tableScanMatch = trimmed.match(/Table scan on\s+([^\s\(\)<>]+)/i);
      if (tableScanMatch) {
        const tableName = tableScanMatch[1];
        if (tableName.toLowerCase() !== 'temporary') {
          result.fullTableScans++;
          if (!result.missingIndexHints.includes(tableName)) {
            result.missingIndexHints.push(tableName);
          }
          result.tables.push({
            table: tableName,
            accessType: 'ALL',
            rowsExamined: 0
          });
        }
      }

      // Parse other scans / lookups
      const indexScanMatch = trimmed.match(/(Index range scan|Index scan|Single-row index lookup|Index lookup) on\s+([^\s\(\)<>]+)/i);
      if (indexScanMatch) {
        const accessType = indexScanMatch[1];
        const tableName = indexScanMatch[2];
        if (tableName.toLowerCase() !== 'temporary') {
          result.tables.push({
            table: tableName,
            accessType: accessType,
            rowsExamined: 0
          });
        }
      }

      // Extract rows examined from scans/lookups to avoid parent double-counting
      const rowsMatch = trimmed.match(/rows=(\d+)/i);
      if (rowsMatch) {
        const rowsVal = parseInt(rowsMatch[1], 10);
        if ((lowerLine.includes('scan') || lowerLine.includes('lookup') || lowerLine.includes('select')) && !lowerLine.includes('<temporary>')) {
          result.totalRowsExamined += rowsVal;
        }
      }
    }
  }

  return result;
}

module.exports = { parseExplainOutput };
