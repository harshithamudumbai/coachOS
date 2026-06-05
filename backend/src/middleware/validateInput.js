const { body, validationResult } = require('express-validator');

const validateAnalyze = [
  body('query')
    .trim()
    .notEmpty().withMessage('Query is required')
    .isLength({ max: 10000 }).withMessage('Query too long (max 10,000 chars)')
    .custom((val) => {
      // Block dangerous statements
      const banned = /\b(DROP|DELETE|TRUNCATE|INSERT|UPDATE|ALTER|CREATE|GRANT|REVOKE|EXEC|EXECUTE|xp_|sp_)\b/i;
      if (banned.test(val)) throw new Error('Only SELECT queries are allowed');
      return true;
    }),
  body('schema')
    .optional()
    .trim()
    .isLength({ max: 20000 }).withMessage('Schema too long (max 20,000 chars)'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateAnalyze };
