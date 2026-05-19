-- ============================================
-- CoachOS Database Schema — Phase 1
-- ============================================
-- 📚 LEARNING NOTES:
-- • CREATE DATABASE  = creates a new database
-- • USE              = switches to that database
-- • AUTO_INCREMENT    = MySQL auto-generates the next ID
-- • VARCHAR(100)      = text up to 100 characters
-- • TEXT              = unlimited text
-- • ENUM              = value must be one of the listed options
-- • FOREIGN KEY       = links this table to another table
-- • ON DELETE CASCADE = if parent row is deleted, child rows are also deleted
-- • TIMESTAMP         = stores date + time
-- • DEFAULT           = value used when you don't provide one
-- ============================================

-- Create database (skip if already exists)
CREATE DATABASE IF NOT EXISTS coachos_db;
USE coachos_db;

-- ============================================
-- 1. COACHES TABLE (enhanced from your existing one)
-- ============================================
-- This is the "parent" table. Every other table references this.
-- Think of it as: 1 Coach → many Clients, many Sessions, many Plans

DROP TABLE IF EXISTS coach_notes;
DROP TABLE IF EXISTS progress_entries;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS coaches;

CREATE TABLE coaches (
    id INT AUTO_INCREMENT PRIMARY KEY,          -- Unique ID, auto-generated
    full_name VARCHAR(100) NOT NULL,            -- Coach's name (required)
    email VARCHAR(255) UNIQUE NOT NULL,         -- Email must be unique
    password_hash VARCHAR(255) NOT NULL,        -- We NEVER store plain passwords!
    business_name VARCHAR(200),                 -- e.g., "FitLife Nutrition"
    subdomain VARCHAR(50) UNIQUE,              -- e.g., "fitlife" → fitlife.coachos.com
    logo_url VARCHAR(500),                      -- URL to uploaded logo
    phone VARCHAR(20),
    specialization VARCHAR(200),                -- e.g., "Weight Loss, PCOS, Diabetes"
    bio TEXT,                                   -- About the coach
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CLIENTS TABLE
-- ============================================
-- Each client belongs to ONE coach (1-to-many relationship)
-- coach_id is a FOREIGN KEY → it MUST match an id in the coaches table

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coach_id INT NOT NULL,                      -- Which coach owns this client
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),     -- Only these 3 values allowed
    height_cm DECIMAL(5,1),                     -- e.g., 170.5
    goals TEXT,                                 -- Client's health goals
    medical_notes TEXT,                         -- Allergies, conditions, etc.
    status ENUM('active', 'inactive', 'paused') DEFAULT 'active',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 🔗 This links clients to coaches
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,

    -- 📌 A coach can't have two clients with the same email
    UNIQUE KEY unique_coach_client (coach_id, email)
);

-- ============================================
-- 3. PROGRESS ENTRIES TABLE
-- ============================================
-- Tracks client progress over time (weight, energy, sleep, etc.)
-- Each entry belongs to ONE client (1-to-many)

CREATE TABLE progress_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    weight_kg DECIMAL(5,2),                     -- e.g., 72.50
    energy_level INT CHECK (energy_level BETWEEN 1 AND 10),
    skin_score INT CHECK (skin_score BETWEEN 1 AND 10),
    sleep_hours DECIMAL(3,1),                   -- e.g., 7.5
    water_litres DECIMAL(3,1),                  -- e.g., 3.0
    mood ENUM('great', 'good', 'okay', 'bad', 'terrible'),
    notes TEXT,
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- ============================================
-- 4. COACH NOTES TABLE
-- ============================================
-- Private notes a coach writes about a client

CREATE TABLE coach_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    coach_id INT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES for faster queries
-- ============================================
-- 📚 INDEX = like a book's index. MySQL can find rows faster.
-- Without index: MySQL scans ALL rows (slow on 10,000+ rows)
-- With index: MySQL jumps directly to matching rows

CREATE INDEX idx_clients_coach ON clients(coach_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_progress_client ON progress_entries(client_id);
CREATE INDEX idx_progress_date ON progress_entries(recorded_date);
CREATE INDEX idx_notes_client ON coach_notes(client_id);

-- ============================================
-- SEED DATA (for testing)
-- ============================================
-- Let's add a test coach so you can test login later
-- Password is "test123" → we'll replace this with bcrypt hash from Node.js

INSERT INTO coaches (full_name, email, password_hash, business_name, specialization)
VALUES ('Test Coach', 'test@coachos.com', 'TEMPORARY_WILL_BE_HASHED', 'FitLife Nutrition', 'Weight Loss, PCOS');

SELECT '✅ CoachOS database schema created successfully!' AS status;
