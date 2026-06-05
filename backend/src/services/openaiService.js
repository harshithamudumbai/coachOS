const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function analyzeWithAI({ query, schema, explainOutput, parsedExplain }) {
  const systemPrompt = `You are simultaneously:
1. Principal Database Architect (15 years MySQL experience)
2. Senior MySQL Performance Engineer
3. Query Optimizer Specialist
4. Production Site Reliability Engineer

You analyze SQL queries and return ONLY valid JSON. No markdown, no backticks, no explanations outside JSON.`;

  const userPrompt = `Analyze this MySQL query:

QUERY:
${query}

${schema ? \`SCHEMA:\\n\${schema}\` : 'No schema provided.'}

${explainOutput ? \`EXPLAIN OUTPUT:\\n\${JSON.stringify(explainOutput, null, 2)}\` : 'EXPLAIN not available (analyze from query structure).'}

${parsedExplain ? \`PARSED STATS:\\n\${JSON.stringify(parsedExplain, null, 2)}\` : ''}

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
      "impact": "<what this costs in production>",
      "fix": "<specific actionable fix>"
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
    const cleaned = raw.replace(/^```json\\n?/, '').replace(/```$/, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Groq API error:", error);
    throw new Error("AI analysis failed.");
  }
}

module.exports = { analyzeWithAI };
