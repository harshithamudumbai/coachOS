const { parseSlowLog } = require('../services/slowLogParser');
const { runDeterministicAnalysis } = require('../services/analysisEngine');
const { analyzeWorkloadWithAI } = require('../services/openaiService');
const { logger } = require('../lib/logger');

async function analyzeWorkload(req, res, next) {
  try {
    // File validation is handled by validateWorkload middleware
    // File is stored in memory (req.file.buffer), not on disk
    const fileContent = req.file.buffer.toString('utf8');

    logger.info('Workload analysis started', {
      requestId: req.id,
      filename: req.file.originalname,
      fileSize: req.file.size,
    });

    // 1. Parse and aggregate
    const aggregatedQueries = parseSlowLog(fileContent);

    if (aggregatedQueries.length === 0) {
      return res.status(400).json({ error: 'Could not parse any queries from the provided log file.' });
    }

    // 2. Select top 5 worst offenders
    const topQueries = aggregatedQueries.slice(0, 5);

    // 3. Run deterministic engine on the top 5
    const engineReports = [];
    for (const q of topQueries) {
      // We don't have schema/indexes or explain tree for these since they are from a log.
      // The analysis engine will still catch SELECT *, Huge IN clauses, Pagination, OR explosions, functions on columns.
      // We pass an empty parsedExplain to avoid errors.
      const deterministicResult = runDeterministicAnalysis({ 
        query: q.exampleQuery, 
        parsedExplain: { fullTableScans: 0, usingFilesort: false, usingTemporaryTable: false, totalRowsExamined: q.totalRowsExamined / q.count },
        indexes: null
      });

      engineReports.push({
        fingerprint: q.fingerprint,
        exampleQuery: q.exampleQuery,
        metrics: {
          executionCount: q.count,
          totalTimeSecs: q.totalTime.toFixed(2),
          maxTimeSecs: q.maxTime.toFixed(2),
          avgRowsExamined: Math.round(q.totalRowsExamined / q.count)
        },
        engineFindings: deterministicResult.detectedIssues
      });
    }

    // 4. Send to AI to generate the Workload Dashboard
    const aiReport = await analyzeWorkloadWithAI(engineReports, aggregatedQueries.length);

    logger.info('Workload analysis completed', {
      requestId: req.id,
      uniquePatterns: aggregatedQueries.length,
    });

    res.json({
      globalMetrics: {
        uniquePatterns: aggregatedQueries.length,
        totalExecutions: aggregatedQueries.reduce((acc, q) => acc + q.count, 0),
        totalTimeSecs: aggregatedQueries.reduce((acc, q) => acc + q.totalTime, 0).toFixed(2),
      },
      topQueries: engineReports,
      aiAnalysis: aiReport
    });
  } catch (err) {
    next(err);
  }
  // No file cleanup needed — memory storage is automatically garbage collected
}

module.exports = { analyzeWorkload };
