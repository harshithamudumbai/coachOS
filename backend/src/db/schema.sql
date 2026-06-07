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
