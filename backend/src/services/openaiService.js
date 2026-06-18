const Groq = require('groq-sdk');
const { logger } = require('../lib/logger');

function collapseQueryForAI(sql) {
  if (typeof sql !== 'string') return sql;
  
  // Collapse IN (...) clauses with many values
  return sql.replace(/\bin\s*\(\s*([^)]+)\s*\)/ig, (match, content) => {
    const values = content.split(',');
    if (values.length > 5) {
      const firstFew = values.slice(0, 5).map(v => v.trim()).join(', ');
      return `IN (${firstFew}, ... [truncated ${values.length - 5} values])`;
    }
    return match;
  });
}

async function analyzeWithAI({ query, schema, indexes, explainOutput, parsedExplain, engineResults }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in .env");
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const collapsedQuery = collapseQueryForAI(query);
  const collapsedExplain = explainOutput
    ? (typeof explainOutput === 'string' ? collapseQueryForAI(explainOutput) : collapseQueryForAI(JSON.stringify(explainOutput, null, 2)))
    : null;
  const systemPrompt = `You are Dr.Query, a Principal Database Performance Engineer with 15+ years of experience in MySQL optimization, query tuning, indexing strategies, database architecture, and production troubleshooting.

Your job is to format the findings of our Deterministic SQL Analysis Engine into a human-friendly DBA report.
You must NOT invent new issues. You must NOT alter the health score.
You analyze the Deterministic Report and return ONLY valid JSON. No markdown, no backticks, no explanations outside JSON.`;

  const userPrompt = `Analyze the following inputs and format the Deterministic Engine Report into the requested JSON schema.

1. SQL Query
2. Table Schema
3. Index Information
4. EXPLAIN Output
5. Deterministic Engine Report (MUST USE)

Rules:
* The DETERMINISTIC ENGINE REPORT is your absolute source of truth.
* You MUST map every issue found in the "Deterministic Engine Report" into the "optimizationRecommendations" array.
* You may use the QUERY, SCHEMA, INDEXES, and EXPLAIN ONLY to generate specific, accurate SQL implementation examples for the engine's findings.
* You may NOT introduce new findings, new bottlenecks, new scores, new risks, or new recommendations that are absent from the engine report.
* Keep the exact healthScore and severity provided by the engine.

QUERY:
${collapsedQuery}

${schema ? `SCHEMA:\n${schema}` : 'No schema provided.'}

${indexes ? `INDEXES:\n${indexes}` : 'No indexes provided.'}

${collapsedExplain ? `EXPLAIN OUTPUT:\n${collapsedExplain}` : 'EXPLAIN not available (analyze from query structure).'}`,StartLine:23,TargetContent:

DETERMINISTIC ENGINE REPORT:
${JSON.stringify(engineResults, null, 2)}

Generate output in exactly this JSON format:
{
  "healthScore": ${engineResults?.healthScore || 0},
  "severity": "${engineResults?.severity || 'Unknown'}",
  "summary": "<2-3 sentence overview of the engine report>",
  "rootCauses": ["<list of strings explaining the root causes of the engine's findings>"],
  "performanceRisks": ["<list of strings detailing risks>"],
  "optimizationRecommendations": [
    {
      "priority": 1,
      "title": "<e.g. Remove SELECT *>",
      "reason": "<why it's bad based on the engine report>",
      "expectedImpact": "<expected impact based on the engine report>",
      "implementation": "<exact SQL snippet to fix it>"
    }
  ],
  "indexRecommendations": ["<SQL for CREATE INDEX if applicable, else empty array>"],
  "queryRewriteSuggestions": ["<Fully rewritten SQL query if applicable, else empty array>"],
  "architectNotes": ["<Senior DBA thoughts on the architecture>"],
  "productionReadiness": "<Pass | Warning | Fail - explain why>",
  "nextSteps": ["<Specific next actions>"]
}

Do not hallucinate. Think like a production DBA formatting a static analysis report.`;

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
    logger.error('Groq API error (analyze)', { error: error.message });
    throw new Error("AI analysis failed.");
  }
}

async function analyzeWorkloadWithAI(engineReports, totalPatterns) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in .env");
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  const systemPrompt = `You are Dr.Query, a Principal Database Performance Engineer.
You are generating a Database Workload Roadmap based on a Slow Query Log parsed by our deterministic engine.
Return ONLY valid JSON. No markdown, no backticks.`;

  const userPrompt = `
We parsed a MySQL Slow Query Log containing ${totalPatterns} unique query patterns.
Here are the top worst offenders identified and analyzed by our Deterministic Engine:

${JSON.stringify(engineReports, null, 2)}

Provide an executive roadmap for optimizing this database workload.
Return EXACTLY this JSON structure:
{
  "executiveSummary": "<2-3 sentences summarizing the overall health of the database based on the workload>",
  "primaryBottlenecks": ["<bottleneck 1>", "<bottleneck 2>"],
  "workloadRecommendations": [
    {
      "priority": 1,
      "title": "<e.g. Add Composite Index to users table>",
      "rationale": "<why>",
      "estimatedImpact": "<impact>"
    }
  ]
}`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1500,
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
    logger.error('Groq API error (workload)', { error: error.message });
    throw new Error("AI workload analysis failed.");
  }
}

module.exports = { analyzeWithAI, analyzeWorkloadWithAI };
