const { logger } = require('../lib/logger');

const errorHandler = (err, req, res, next) => {
  // Log the full error internally (never sent to client)
  logger.error('Unhandled error', {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack,
    statusCode: err.status || 500,
  });

  const statusCode = err.status || 500;

  // In production: NEVER expose error details, stack traces, or internal paths
  // In development: show the error message for debugging
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    requestId: req.id, // Always include for support/debugging correlation
  });
};

module.exports = { errorHandler };
