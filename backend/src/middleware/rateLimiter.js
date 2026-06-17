const rateLimit = require('express-rate-limit');
const { logger } = require('../lib/logger');

// Global rate limiter — applied to ALL routes
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,          // 1 minute
  max: 100,                      // 100 requests per minute per IP
  standardHeaders: true,         // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Global rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
  },
});

// Per-route: analyze endpoint (expensive — hits AI + DB)
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,          // 1 minute
  max: 10,                       // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Analyze rate limit exceeded', { ip: req.ip });
    res.status(429).json({ error: 'Too many analysis requests. Please wait a moment.' });
  },
});

// Per-route: history endpoint (read-only, more generous)
const historyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('History rate limit exceeded', { ip: req.ip });
    res.status(429).json({ error: 'Too many requests.' });
  },
});

// Per-route: workload upload (very expensive — file parsing + AI)
const workloadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Workload rate limit exceeded', { ip: req.ip });
    res.status(429).json({ error: 'Too many log uploads. Please wait a moment.' });
  },
});

module.exports = { globalLimiter, analyzeLimiter, historyLimiter, workloadLimiter };
