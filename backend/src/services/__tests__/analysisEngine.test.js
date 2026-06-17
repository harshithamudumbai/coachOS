const { runDeterministicAnalysis } = require('../analysisEngine');

describe('Deterministic Analysis Engine', () => {

  it('detects SELECT_STAR', () => {
    const result = runDeterministicAnalysis({ query: 'SELECT * FROM users' });
    expect(result.triggeredRules).toContain('SELECT_STAR');
    expect(result.healthScore).toBe(95); // 100 - 5
  });

  it('detects FUNCTION_ON_INDEXED_COLUMN', () => {
    const result = runDeterministicAnalysis({ query: 'SELECT id FROM users WHERE YEAR(created_at) = 2025' });
    expect(result.triggeredRules).toContain('FUNCTION_ON_INDEXED_COLUMN');
  });

  it('detects FILESORT', () => {
    const parsedExplain = { usingFilesort: true };
    const result = runDeterministicAnalysis({ query: 'SELECT id FROM users ORDER BY created_at', parsedExplain });
    expect(result.triggeredRules).toContain('FILESORT');
  });

  it('detects PAGINATION_RISK', () => {
    const result = runDeterministicAnalysis({ query: 'SELECT id FROM users LIMIT 100000, 20' });
    expect(result.triggeredRules).toContain('PAGINATION_RISK');
  });

  it('detects HUGE_IN_CLAUSE', () => {
    // Generate an IN clause with 200 values
    const ids = Array.from({ length: 200 }, (_, i) => i).join(',');
    const result = runDeterministicAnalysis({ query: `SELECT id FROM users WHERE id IN (${ids})` });
    expect(result.triggeredRules).toContain('HUGE_IN_CLAUSE');
  });

  it('detects INDEX_REDUNDANCY', () => {
    const indexes = `
      idx_status (status)
      idx_status_created (status, created_at)
    `;
    const result = runDeterministicAnalysis({ query: 'SELECT id FROM users', indexes });
    expect(result.triggeredRules).toContain('INDEX_REDUNDANCY');
  });

  it('does NOT trigger false positives on a clean query', () => {
    const result = runDeterministicAnalysis({ 
      query: 'SELECT id, name FROM users WHERE id = 5 LIMIT 10',
      parsedExplain: { fullTableScans: 0, usingFilesort: false, usingTemporaryTable: false, totalRowsExamined: 1 }
    });
    
    expect(result.triggeredRules.length).toBe(0);
    expect(result.healthScore).toBe(100);
    expect(result.severity).toBe('Excellent');
  });

  it('returns engine version metadata', () => {
    const result = runDeterministicAnalysis({ query: 'SELECT id FROM users' });
    expect(result.engineVersion).toBe("1.0");
    expect(result.executedRules.length).toBeGreaterThan(10);
  });
});
