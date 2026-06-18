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

  it('correctly parses tree-format EXPLAIN output', () => {
    const treeExplain = `
-> Sort row IDs: fch.id DESC  (actual time=40006..40088 rows=27681 loops=1)
   -> Table scan on <temporary>  (actual time=39976..40001 rows=27681 loops=1)
       -> Aggregate using temporary table  (actual time=39976..39976 rows=27680 loops=1)
           -> Nested loop left join  (cost=262e+9 rows=0) (actual time=39151..39657 rows=27681 loops=1)
               -> Filter: ((fch.archive = 0) and (fch.id in (133533,133551))) (actual time=0.076..32.3 rows=27681 loops=1)
                   -> Table scan on fch  (actual time=0.070..27.8 rows=27681 loops=1)
    `;
    const result = parseExplainOutput(treeExplain);
    
    expect(result.usingFilesort).toBe(true);
    expect(result.usingTemporaryTable).toBe(true);
    expect(result.fullTableScans).toBe(1);
    expect(result.missingIndexHints).toContain('fch');
    expect(result.totalRowsExamined).toBe(27681);
  });

  it('correctly parses tabular-format EXPLAIN output', () => {
    const tabularExplain = `
+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+---------------------------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows  | filtered | Extra                           |
+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+---------------------------------+
|  1 | SIMPLE      | fch   | NULL       | ALL  | PRIMARY       | NULL | NULL    | NULL | 27681 |   100.00 | Using temporary; Using filesort |
+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+---------------------------------+
    `;
    const result = parseExplainOutput(tabularExplain);

    expect(result.usingFilesort).toBe(true);
    expect(result.usingTemporaryTable).toBe(true);
    expect(result.fullTableScans).toBe(1);
    expect(result.missingIndexHints).toContain('fch');
    expect(result.totalRowsExamined).toBe(27681);
  });

});
