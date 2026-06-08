const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { runExplain } = require('../services/mysqlService');
const { parseExplainOutput } = require('../services/explainParser');
const { analyzeWithAI } = require('../services/openaiService');
const { runDeterministicAnalysis } = require('../services/analysisEngine');
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

    // Deterministic Analysis First
    const engineResults = runDeterministicAnalysis({ query, parsedExplain, indexes });

    // AI formatting
    const analysis = await analyzeWithAI({ query, schema, indexes, explainOutput, parsedExplain, engineResults });

    // Overwrite AI score/severity with deterministic values to prevent hallucination
    analysis.healthScore = engineResults.healthScore;
    analysis.severity = engineResults.severity;
    
    // Pass rule coverage to the frontend
    analysis.ruleCoverage = {
      executed: engineResults.executedRules,
      triggered: engineResults.triggeredRules
    };

    // Replace the AI's findings array directly with the deterministic findings (with injected confidence & AI recommendations)
    // Actually, AI generates `optimizationRecommendations`. We just ensure they exist.

    // BENCHMARKING: If AI suggested a rewrite, run EXPLAIN on it safely
    let benchmarkResults = null;
    if (analysis.queryRewriteSuggestions && analysis.queryRewriteSuggestions.length > 0) {
      try {
        const rewrite = analysis.queryRewriteSuggestions[0];
        
        if (typeof rewrite === 'string') {
           const upperRewrite = rewrite.trim().toUpperCase();
           
           // Strict Security Guardrail: Only allow SELECT or WITH
           const isSelect = upperRewrite.startsWith('SELECT') || upperRewrite.startsWith('WITH');
           
           // Strict Security Guardrail: Reject destructive commands completely
           const hasDestructive = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|REPLACE|GRANT|REVOKE)\b/.test(upperRewrite);
           
           if (isSelect && !hasDestructive) {
             const rewriteExplainOutput = await runExplain(rewrite);
             const rewriteParsed = parseExplainOutput(rewriteExplainOutput);
             
             if (rewriteParsed && parsedExplain) {
               const origRows = parsedExplain.totalRowsExamined;
               const newRows = rewriteParsed.totalRowsExamined;
               let improvementPercent = 0;
               if (origRows > 0 && newRows < origRows) {
                 improvementPercent = Math.round(((origRows - newRows) / origRows) * 100);
               }

               benchmarkResults = {
                 originalRows: origRows,
                 rewrittenRows: newRows,
                 improvementPercent: improvementPercent,
                 originalCost: parsedExplain.tables.reduce((acc, t) => acc + (parseFloat(t.costInfo?.query_cost || 0)), 0),
                 rewrittenCost: rewriteParsed.tables.reduce((acc, t) => acc + (parseFloat(t.costInfo?.query_cost || 0)), 0),
               };
             }
           } else {
             console.warn("Benchmark skipped: Rewrite rejected by security guardrails.", rewrite);
           }
        }
      } catch (benchmarkErr) {
        // Silently fail benchmark if AI hallucinated invalid SQL
        console.warn("Benchmark failed: ", benchmarkErr.message);
      }
    }
    
    analysis.benchmarkResults = benchmarkResults;

    // Save to history (hash IP for basic privacy)
    const ipHash = crypto
      .createHash('sha256')
      .update(req.ip || 'unknown')
      .digest('hex');

    const id = uuidv4();
    await pool.execute(
      `INSERT INTO analysis_history (id, query_text, schema_text, indexes_text, pasted_explain_text, health_score, analysis_json, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, query, schema || null, indexes || null, pastedExplain || null, analysis.healthScore, JSON.stringify(analysis), ipHash]
    );

    res.json({ id, ...analysis });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyze };
