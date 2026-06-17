const router = require('express').Router();
const { historyLimiter } = require('../middleware/rateLimiter');
const { getHistory } = require('../controllers/historyController');

router.get('/', historyLimiter, getHistory);

module.exports = router;
