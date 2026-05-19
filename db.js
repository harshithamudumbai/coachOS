// ============================================
// db.js — MySQL Connection with Connection Pool
// ============================================
// 📚 LEARNING NOTES:
// • createPool vs createConnection:
//   - createConnection = 1 connection, breaks if it disconnects
//   - createPool = many connections, auto-reconnects, handles multiple requests
//   - ALWAYS use pool in production!
// • promise() = lets us use async/await instead of callbacks
// ============================================

const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  
  // Pool settings
  waitForConnections: true,   // Wait if all connections are busy
  connectionLimit: 10,        // Max 10 simultaneous connections
  queueLimit: 0               // Unlimited queue (0 = no limit)
});

// Test the connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL (Pool)');
  connection.release(); // Always release back to pool!
});

// Export the promise-based pool so we can use async/await
module.exports = pool.promise();
