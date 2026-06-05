const { pool } = require('../db/connection');

async function getHistory(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, query_text, health_score, created_at
       FROM analysis_history
       ORDER BY created_at DESC
       LIMIT 20`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { getHistory };
