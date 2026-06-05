const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { requestLogger } = require('./middleware/requestLogger');
const { errorHandler } = require('./middleware/errorHandler');
const analyzeRoutes = require('./routes/analyze');
const historyRoutes = require('./routes/history');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Body parsing
app.use(express.json({ limit: '50kb' }));

// Logging
app.use(requestLogger);

// Routes
app.use('/analyze', analyzeRoutes);
app.use('/history', historyRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
