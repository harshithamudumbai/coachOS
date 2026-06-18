const mysql = require('mysql2/promise');
const { logger } = require('../lib/logger');

const isProduction = process.env.NODE_ENV === 'production';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Connection timeout — don't hang forever
  connectTimeout: 10000,    // 10 seconds to establish connection
  // SSL configuration — secure in production
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false } // Aiven uses self-signed certificates by default
    : false,
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    logger.info('MySQL connected successfully', {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
    });
    conn.release();
  } catch (err) {
    logger.error('MySQL connection failed', {
      message: err.message,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
    });
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
