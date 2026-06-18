const { body, validationResult } = require('express-validator');
const { logger } = require('../lib/logger');

/**
 * Validation for POST /analyze
 */
const validateAnalyze = [
  body('query')
    .trim()
    .notEmpty().withMessage('Query is required')
    .isLength({ max: 1000000 }).withMessage('Query too long (max 1,000,000 chars)')
    .custom((val) => {
      // Block dangerous statements
      const banned = /\b(DROP|DELETE|TRUNCATE|INSERT|UPDATE|ALTER|CREATE|GRANT|REVOKE|EXEC|EXECUTE|xp_|sp_)\b/i;
      if (banned.test(val)) throw new Error('Only SELECT queries are allowed');
      return true;
    }),
  body('schema')
    .optional()
    .trim()
    .isLength({ max: 1000000 }).withMessage('Schema too long (max 1,000,000 chars)'),
  body('indexes')
    .optional()
    .trim()
    .isLength({ max: 500000 }).withMessage('Indexes too long (max 500,000 chars)'),
  body('pastedExplain')
    .optional()
    .trim()
    .isLength({ max: 2000000 }).withMessage('Pasted EXPLAIN too long (max 2,000,000 chars)'),
  handleValidationErrors,
];

/**
 * Validation for POST /workload/analyze (file upload)
 * Note: File size/type is enforced by multer config in the route.
 * This validates that the file actually exists after multer processing.
 */
const validateWorkload = [
  (req, res, next) => {
    if (!req.file) {
      logger.warn('Workload upload rejected: no file', { ip: req.ip });
      return res.status(400).json({ error: 'No slow query log file uploaded' });
    }

    // Validate file extension server-side (defense in depth)
    const allowedExtensions = ['.log', '.txt'];
    const originalName = req.file.originalname || '';
    const ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      logger.warn('Workload upload rejected: invalid extension', { 
        ip: req.ip, 
        filename: originalName,
        extension: ext,
      });
      return res.status(400).json({ error: 'Only .log and .txt files are accepted' });
    }

    // Validate that the file content is valid UTF-8 text (not binary)
    try {
      const content = req.file.buffer.toString('utf8');
      // Check for null bytes (common in binary files)
      if (content.includes('\0')) {
        logger.warn('Workload upload rejected: binary content detected', { ip: req.ip });
        return res.status(400).json({ error: 'File appears to be binary. Only text log files are accepted.' });
      }
    } catch (err) {
      logger.warn('Workload upload rejected: cannot read as text', { ip: req.ip });
      return res.status(400).json({ error: 'File is not valid text.' });
    }

    next();
  },
];

/**
 * Shared validation error handler
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Input validation failed', {
      ip: req.ip,
      path: req.path,
      errors: errors.array().map(e => e.msg),
    });
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = { validateAnalyze, validateWorkload };
