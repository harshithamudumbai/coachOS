const Groq = require('groq-sdk');

async function analyzeWithAI({ query, schema, indexes, explainOutput, parsedExplain }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in .env");
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const systemPrompt = `You are simultaneously:
1. Principal Database Architect (15 years MySQL experience)
2. Senior MySQL Performance Engineer
3. Query Optimizer Specialist
4. Production Site Reliability Engineer

You analyze SQL queries and return ONLY valid JSON. No markdown, no backticks, no explanations outside JSON.`;

  const userPrompt = `Analyze this MySQL query like a Senior DBA reviewing a production issue. Do not merely describe the execution plan. Proactively identify common performance patterns and suggest fixes.

Look for issues such as:
- N+1 query patterns (suggest JOINs).
- Huge IN (...) lists (suggest temporary tables, staging tables, or JOINs).
- Unnecessary SELECT * (recommend specific columns).
- Functions on indexed columns (explain index loss, suggest alternatives).
- OR conditions preventing index usage (suggest UNION ALL).
- ORDER BY / GROUP BY causing filesort/temp tables (suggest suitable indexes).
- Pagination with large OFFSET (suggest keyset/seek pagination).
- Row explosion from JOINs (suggest filtering earlier).
- Repeated subqueries (suggest JOINs, CTEs, or temp tables).
- Aggregates on large datasets (suggest pre-aggregation or summary tables).
- Queries that may simply be slow (recommend enabling Slow Query Log and provide the configuration snippet).

Whenever recommending an optimization in the 'bottlenecks' array, provide:
1. Why the issue occurs.
2. Expected impact.
3. Exact SQL example to implement the fix.

QUERY:
${query}

${schema ? `SCHEMA:\n${schema}` : 'No schema provided.'}

${indexes ? `INDEXES:\n${indexes}` : 'No indexes provided.'}

${explainOutput ? `EXPLAIN OUTPUT:\n${typeof explainOutput === 'string' ? explainOutput : JSON.stringify(explainOutput, null, 2)}` : 'EXPLAIN not available (analyze from query structure).'}

${parsedExplain ? `PARSED STATS:\n${JSON.stringify(parsedExplain, null, 2)}` : ''}

Return this exact JSON structure (no extra keys, no markdown):
{
  "health_score": <integer 0-100>,
  "estimated_improvement": "<e.g. '65% faster'>",
  "execution_complexity": "<'Low' | 'Medium' | 'High'>",
  "tables_scanned": <integer>,
  "bottlenecks": [
    {
      "id": "<unique string>",
      "problem": "<clear problem title>",
      "severity": "<'Critical' | 'High' | 'Medium' | 'Low'>",
      "impact": "<what this costs in production. Include: 1. Why it occurs. 2. Expected impact.>",
      "fix": "<Exact SQL example to implement the fix>"
    }
  ],
  "missing_indexes": [
    {
      "id": "<unique string>",
      "sql": "CREATE INDEX idx_name ON table_name(column_name);",
      "reason": "<why this index is needed>",
      "expected_benefit": "<what improves>",
      "estimated_improvement": "<e.g. '80% fewer rows scanned'>"
    }
  ],
  "rewritten_query": "<optimized SQL string or null if no rewrite needed>",
  "rewrite_explanation": "<why the rewrite improves performance, or null>",
  "scale_simulation": {
    "rows_10k": "<e.g. '<1ms'>",
    "rows_100k": "<e.g. '~12ms'>",
    "rows_1m": "<e.g. '~180ms'>",
    "rows_10m": "<e.g. '~2.4s'>",
    "rows_100m": "<e.g. '~28s or timeout'>"
  },
  "risk_assessment": {
    "cpu_risk": "<'Low' | 'Medium' | 'High' | 'Critical'>",
    "memory_risk": "<'Low' | 'Medium' | 'High' | 'Critical'>",
    "lock_risk": "<'Low' | 'Medium' | 'High' | 'Critical'>",
    "replication_risk": "<'Low' | 'Medium' | 'High' | 'Critical'>",
    "scalability_risk": "<'Low' | 'Medium' | 'High' | 'Critical'>"
  },
  "summary": "<2-3 sentence plain-English summary of the main findings>"
}`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const raw = response.choices[0].message.content.trim();
    const cleaned = raw.replace(/^```json\n?/, '').replace(/```$/, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Groq API error:", error);
    throw new Error("AI analysis failed.");
  }
}

module.exports = { analyzeWithAI };
