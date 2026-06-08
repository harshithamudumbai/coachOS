const Groq = require('groq-sdk');

async function analyzeWithAI({ query, schema, indexes, explainOutput, parsedExplain, engineResults }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in .env");
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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
* You MUST map every issue found in the "Deterministic Engine Report" into the "optimizationRecommendations" array.
* Do NOT hallucinate new bottlenecks that the engine did not find.
* Provide exact SQL implementations for the engine's recommendations.
* Keep the exact healthScore and severity provided by the engine.

QUERY:
${query}

${schema ? `SCHEMA:\n${schema}` : 'No schema provided.'}

${indexes ? `INDEXES:\n${indexes}` : 'No indexes provided.'}

${explainOutput ? `EXPLAIN OUTPUT:\n${typeof explainOutput === 'string' ? explainOutput : JSON.stringify(explainOutput, null, 2)}` : 'EXPLAIN not available (analyze from query structure).'}

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
    console.error("Groq API error:", error);
    throw new Error("AI analysis failed.");
  }
}

module.exports = { analyzeWithAI };
