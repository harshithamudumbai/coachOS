const { parseExplainOutput } = require('../explainParser');

describe('EXPLAIN Parser', () => {

  it('detects a full table scan', () => {
    const rawExplain = {
      query_block: {
        table_name: 'users',
        access_type: 'ALL',
        rows_examined_per_scan: 5000
      }
    };
    const result = parseExplainOutput(rawExplain);
    
    expect(result.fullTableScans).toBe(1);
    expect(result.missingIndexHints).toContain('users');
    expect(result.totalRowsExamined).toBe(5000);
  });

  it('detects filesort in ordering_operation', () => {
    const rawExplain = {
      query_block: {
        ordering_operation: {
          using_filesort: true,
          table: {
            table_name: 'posts',
            access_type: 'ref'
          }
        }
      }
    };
    const result = parseExplainOutput(rawExplain);
    
    expect(result.usingFilesort).toBe(true);
    expect(result.tables[0].table).toBe('posts');
  });

  it('detects temporary table in grouping_operation', () => {
    const rawExplain = {
      query_block: {
        grouping_operation: {
          using_temporary_table: true,
          table: {
            table_name: 'comments',
            access_type: 'index'
          }
        }
      }
    };
    const result = parseExplainOutput(rawExplain);
    
    expect(result.usingTemporaryTable).toBe(true);
    expect(result.tables[0].table).toBe('comments');
  });

  it('handles null or invalid input gracefully', () => {
    expect(parseExplainOutput(null)).toBeNull();
    expect(parseExplainOutput("invalid json string")).toBeNull();
  });

});
