const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { runExplain } = require('../services/mysqlService');
const { parseExplainOutput } = require('../services/explainParser');
const { analyzeWithAI } = require('../services/openaiService');
const { pool } = require('../db/connection');

async function analyze(req, res, next) {
  try {
    const { query, schema, indexes, pastedExplain } = req.body;

    // Run EXPLAIN if not pasted
    let explainOutput = null;
    let parsedExplain = null;
    
    if (pastedExplain) {
      // Use the pasted EXPLAIN string directly
      explainOutput = pastedExplain;
    } else {
      explainOutput = await runExplain(query);
      parsedExplain = parseExplainOutput(explainOutput);
    }

    // AI analysis
    const analysis = await analyzeWithAI({ query, schema, indexes, explainOutput, parsedExplain });

    // Save to history (hash IP for basic privacy)
    const ipHash = crypto
      .createHash('sha256')
      .update(req.ip || 'unknown')
      .digest('hex');

    const id = uuidv4();
    await pool.execute(
      `INSERT INTO analysis_history (id, query_text, schema_text, indexes_text, pasted_explain_text, health_score, analysis_json, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, query, schema || null, indexes || null, pastedExplain || null, analysis.health_score, JSON.stringify(analysis), ipHash]
    );

    res.json({ id, ...analysis });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyze };
