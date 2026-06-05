const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { runExplain } = require('../services/mysqlService');
const { parseExplainOutput } = require('../services/explainParser');
const { analyzeWithAI } = require('../services/openaiService');
const { pool } = require('../db/connection');

async function analyze(req, res, next) {
  try {
    const { query, schema } = req.body;

    // Run EXPLAIN
    const explainOutput = await runExplain(query);
    const parsedExplain = parseExplainOutput(explainOutput);

    // AI analysis
    const analysis = await analyzeWithAI({ query, schema, explainOutput, parsedExplain });

    // Save to history (hash IP for basic privacy)
    const ipHash = crypto
      .createHash('sha256')
      .update(req.ip || 'unknown')
      .digest('hex');

    const id = uuidv4();
    await pool.execute(
      `INSERT INTO analysis_history (id, query_text, schema_text, health_score, analysis_json, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, query, schema || null, analysis.health_score, JSON.stringify(analysis), ipHash]
    );

    res.json({ id, ...analysis });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyze };
