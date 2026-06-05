function parseExplainOutput(explainJson) {
  if (!explainJson) return null;

  try {
    const plan = typeof explainJson === 'string'
      ? JSON.parse(explainJson)
      : explainJson;

    const result = {
      tables: [],
      fullTableScans: 0,
      totalRowsExamined: 0,
      missingIndexHints: []
    };

    function traverseNode(node) {
      if (!node) return;

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
    }

    traverseNode(plan?.query_block);
    return result;
  } catch (e) {
    return null;
  }
}

module.exports = { parseExplainOutput };
