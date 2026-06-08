const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeWorkload } = require('../controllers/workloadController');

const upload = multer({ dest: 'uploads/' });

router.post('/analyze', upload.single('slowLog'), analyzeWorkload);

module.exports = router;
