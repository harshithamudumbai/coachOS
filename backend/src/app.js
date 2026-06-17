const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const crypto = require('crypto');
const { globalLimiter } = require('./middleware/rateLimiter');
const { sanitizeInput } = require('./middleware/sanitize');
const { requestLogger } = require('./middleware/requestLogger');
const { errorHandler } = require('./middleware/errorHandler');
const analyzeRoutes = require('./routes/analyze');
const historyRoutes = require('./routes/history');
const { logger } = require('./lib/logger');

const app = express();

// -------------------------------------------------------------------
// Trust proxy (required for correct IP detection behind reverse proxies
// like Vercel, Railway, Render, etc.)
// -------------------------------------------------------------------
app.set('trust proxy', 1);

// -------------------------------------------------------------------
// Request ID — attach a unique ID to every request for traceability
// -------------------------------------------------------------------
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// -------------------------------------------------------------------
// Security Headers (Helmet) — HSTS, CSP, X-Frame, etc.
// -------------------------------------------------------------------
app.use(helmet({
  // Enforce HTTPS for 1 year (browsers will refuse HTTP after first visit)
  hsts: {
    maxAge: 31536000,            // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  // Content Security Policy — restrictive defaults
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  // Clickjacking protection
  frameguard: { action: 'deny' },
  // Prevent MIME-type sniffing
  noSniff: true,
  // Disable X-Powered-By header (don't advertise Express)
  hidePoweredBy: true,
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// -------------------------------------------------------------------
// CORS — whitelist only your own domains
// -------------------------------------------------------------------
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : [];

// In development, also allow localhost
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    logger.warn('CORS blocked request from unauthorized origin', { origin });
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  maxAge: 86400, // Cache preflight for 24 hours
}));

// -------------------------------------------------------------------
// Global Rate Limiter — 100 requests/min per IP across all routes
// -------------------------------------------------------------------
app.use(globalLimiter);

// -------------------------------------------------------------------
// Body parsing with size limits
// -------------------------------------------------------------------
app.use(express.json({ limit: '50kb' }));

// -------------------------------------------------------------------
// Input Sanitization — strip XSS vectors from all inputs
// -------------------------------------------------------------------
app.use(sanitizeInput);

// -------------------------------------------------------------------
// Request Logging — structured JSON logs for every request
// -------------------------------------------------------------------
app.use(requestLogger);

// -------------------------------------------------------------------
// Routes
// -------------------------------------------------------------------
const workloadRoutes = require('./routes/workloadRoutes');

app.use('/analyze', analyzeRoutes);
app.use('/history', historyRoutes);
app.use('/workload', workloadRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// -------------------------------------------------------------------
// Error handler (must be last)
// -------------------------------------------------------------------
app.use(errorHandler);

module.exports = app;
