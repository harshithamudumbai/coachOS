const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeWorkload } = require('../controllers/workloadController');
const { workloadLimiter } = require('../middleware/rateLimiter');
const { validateWorkload } = require('../middleware/validateInput');
const { logger } = require('../lib/logger');

// Use memory storage instead of disk to prevent path traversal attacks
// and avoid leaving temp files on the server
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Server-side file type validation
    const allowedMimes = ['text/plain', 'application/octet-stream'];
    const allowedExtensions = ['.log', '.txt'];
    const ext = (file.originalname || '').substring(file.originalname.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      logger.warn('Multer rejected file: invalid extension', {
        filename: file.originalname,
        extension: ext,
      });
      return cb(new Error('Only .log and .txt files are accepted'), false);
    }

    cb(null, true);
  },
});

router.post('/analyze', workloadLimiter, upload.single('slowLog'), validateWorkload, analyzeWorkload);

module.exports = router;
