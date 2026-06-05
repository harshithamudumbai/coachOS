const { pool } = require('../db/connection');

async function runExplain(query) {
  let conn;
  try {
    conn = await pool.getConnection();

    // Read-only safeguard: set session to read only
    await conn.execute("SET SESSION TRANSACTION READ ONLY");

    const cleanQuery = query.trim().replace(/;$/, '');
    const [rows] = await conn.execute(`EXPLAIN FORMAT=JSON ${cleanQuery}`);
    return rows[0]['EXPLAIN'];
  } catch (err) {
    // If EXPLAIN fails (syntax error etc), return null — AI will still analyze
    console.warn('EXPLAIN failed:', err.message);
    return null;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { runExplain };
