const { pool } = require('../db/connection');
const { logger } = require('../lib/logger');

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
    logger.warn('EXPLAIN failed', { error: err.message });
    return null;
  } finally {
    if (conn) {
      try {
        // Reset the connection state before returning it to the pool
        await conn.execute("SET SESSION TRANSACTION READ WRITE");
      } catch (e) {
        logger.warn('Failed to reset transaction state', { error: e.message });
      }
      conn.release();
    }
  }
}

module.exports = { runExplain };
