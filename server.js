// ============================================
// server.js — CoachOS API Server
// ============================================
// 📚 LEARNING NOTES:
//
// What is Express.js?
// → A framework that makes building APIs easy in Node.js
// → Without Express, you'd write raw HTTP code (painful!)
//
// What is app.use()?
// → Registers middleware that runs on EVERY request
// → Order matters! Middleware runs top to bottom
//
// What is CORS?
// → Cross-Origin Resource Sharing
// → Your React app runs on port 3001, backend on port 3000
// → Browsers block requests between different ports by default
// → CORS tells the browser "it's okay, allow this"
//
// Architecture pattern: Route → Controller → Database
// → server.js loads routes
// → routes/auth.js handles auth logic
// → routes/clients.js handles client logic
// → db.js manages database connection
// ============================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE (runs on every request)
// ============================================

// Parse JSON request bodies
app.use(express.json());

// Allow frontend to talk to backend (CORS)
app.use(cors({ 
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true 
}));

// 📚 Request logger — helps with debugging
// This logs every incoming request to the console
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint — useful for monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'CoachOS API',
    timestamp: new Date().toISOString() 
  });
});

// Auth routes (signup, login, profile)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Client routes (CRUD, progress, notes)
const clientRoutes = require('./routes/clients');
app.use('/api/clients', clientRoutes);

// Dashboard routes (stats, activity feed)
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler — when no route matches
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    hint: `${req.method} ${req.url} does not exist. Check the API docs.`
  });
});

// Global error handler — catches unhandled errors
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🧑‍⚕️  CoachOS API Server            ║
  ║   Running on http://localhost:${PORT}   ║
  ║   Press Ctrl+C to stop              ║
  ╚══════════════════════════════════════╝
  `);
});
