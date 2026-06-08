const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeWorkload } = require('../controllers/workloadController');
const { workloadLimiter } = require('../middleware/rateLimiter');

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/analyze', workloadLimiter, upload.single('slowLog'), analyzeWorkload);

module.exports = router;
