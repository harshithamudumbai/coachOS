const router = require('express').Router();
const { analyzeLimiter } = require('../middleware/rateLimiter');
const { validateAnalyze } = require('../middleware/validateInput');
const { analyze } = require('../controllers/analyzeController');

router.post('/', analyzeLimiter, validateAnalyze, analyze);

module.exports = router;
