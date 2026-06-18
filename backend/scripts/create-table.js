require('dotenv').config();
const mysql = require('mysql2/promise');

async function createTable() {
  console.log('Connecting to Aiven MySQL...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  const sql = `
    CREATE TABLE IF NOT EXISTS analysis_history (
      id VARCHAR(36) PRIMARY KEY,
      query_text TEXT NOT NULL,
      schema_text TEXT,
      health_score INT,
      analysis_json LONGTEXT,
      indexes_text TEXT,
      pasted_explain_text TEXT,
      ip_hash VARCHAR(64),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_created_at (created_at)
    );
  `;

  try {
    console.log('Creating table...');
    await connection.execute(sql);
    console.log('✅ Table "analysis_history" created successfully!');
  } catch (err) {
    console.error('❌ Failed to create table:', err.message);
  } finally {
    await connection.end();
  }
}

createTable();
