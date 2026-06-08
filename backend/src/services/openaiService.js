const Groq = require('groq-sdk');

async function analyzeWithAI({ query, schema, indexes, explainOutput, parsedExplain }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in .env");
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const systemPrompt = `You are Dr.Query, a Principal Database Performance Engineer with 15+ years of experience in MySQL optimization, query tuning, indexing strategies, database architecture, and production troubleshooting.

Your job is NOT to simply explain the query.

Your primary responsibility is to identify performance bottlenecks, estimate their impact, determine root causes, and provide practical optimization recommendations that can be applied in production environments.

You analyze SQL queries and return ONLY valid JSON. No markdown, no backticks, no explanations outside JSON.`;

  const userPrompt = `Analyze the following inputs:

1. SQL Query
2. Table Schema
3. Index Information
4. EXPLAIN Output
5. EXPLAIN ANALYZE Output (if available)
6. Slow Query Log Information (if available)

Perform the analysis exactly like a senior database architect conducting a production performance review.

Rules:
* Never provide generic advice.
* Every recommendation must reference evidence from the query, schema, indexes, or execution plan.
* Quantify impact whenever possible.
* Prioritize recommendations from highest impact to lowest impact.
* Identify both immediate fixes and long-term architectural improvements.
* Think critically before recommending indexes.
* Avoid recommending redundant indexes.
* Consider write overhead caused by additional indexes.
* Detect anti-patterns automatically.

Check for:
1. Full Table Scans
2. Index Misses
3. Missing Composite Indexes
4. Temporary Tables
5. Filesorts
6. Large Row Examinations
7. SELECT *
8. Excessive JOIN Complexity
9. Subquery Inefficiencies
10. Correlated Subqueries
11. Large IN Clauses
12. OR Condition Performance Problems
13. Function Usage Preventing Index Access
14. Data Type Mismatches
15. Potential N+1 Query Patterns
16. Over-Fetching
17. Duplicate Conditions
18. Pagination Issues
19. Covering Index Opportunities
20. Partitioning Opportunities

Special Cases:
If query contains hundreds or thousands of IDs in an IN() clause:
* Recommend temporary table strategy.
* Explain expected performance gains.

If query performs filesort:
* Explain why.
* Recommend index changes if appropriate.

If query uses SELECT *:
* Recommend explicit column selection.

If query scans a large percentage of a table:
* Explain why indexes are not being used.

If execution plan indicates poor cardinality:
* Mention statistics refresh possibilities.

QUERY:
${query}

${schema ? `SCHEMA:\n${schema}` : 'No schema provided.'}

${indexes ? `INDEXES:\n${indexes}` : 'No indexes provided.'}

${explainOutput ? `EXPLAIN OUTPUT:\n${typeof explainOutput === 'string' ? explainOutput : JSON.stringify(explainOutput, null, 2)}` : 'EXPLAIN not available (analyze from query structure).'}

${parsedExplain ? `PARSED STATS:\n${JSON.stringify(parsedExplain, null, 2)}` : ''}

Generate output in exactly this JSON format:
{
  "healthScore": 0,
  "severity": "Low | Medium | High | Critical",
  "summary": "",
  "rootCauses": [],
  "performanceRisks": [],
  "optimizationRecommendations": [
    {
      "priority": 1,
      "title": "",
      "reason": "",
      "expectedImpact": "",
      "implementation": ""
    }
  ],
  "indexRecommendations": [],
  "queryRewriteSuggestions": [],
  "architectNotes": [],
  "productionReadiness": "",
  "nextSteps": []
}

Scoring Guidelines:
90-100 = Excellent
75-89 = Good
50-74 = Needs Optimization
25-49 = Poor
0-24 = Critical

Do not hallucinate. If evidence is insufficient, explicitly state the limitation. Think like a production DBA responsible for reducing latency, lowering database load, and improving scalability.`;

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
