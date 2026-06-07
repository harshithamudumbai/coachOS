# Dr.Query: AI-Powered SQL Performance Analyzer 🩺🚀

Dr.Query is a full-stack, AI-driven developer tool designed to automatically diagnose, explain, and optimize complex MySQL queries. By combining standard database execution plans (`EXPLAIN` / `EXPLAIN ANALYZE`) with Large Language Models (LLaMA 3 via Groq), Dr.Query provides actionable insights, bottleneck detection, and intelligent rewriting suggestions to ensure your databases run at peak performance.

## ✨ Features

- **Automated Query Diagnostics**: Enter a query and schema, and Dr.Query will automatically execute an `EXPLAIN` to retrieve the database execution plan.
- **AI Query Optimizer**: Leverages LLaMA 3 (via the Groq SDK) acting as a Principal Database Architect to analyze table scans, missing indexes, and execution complexity.
- **Remote DB Support**: Need to analyze a production database? Simply paste your `SHOW INDEXES` and `EXPLAIN ANALYZE` output directly into the UI for external optimization without requiring local DB access.
- **Query History & Tracking**: Analyzed queries and their resulting AI insights are persisted in a local MySQL database for historical tracking and review.
- **Modern, Premium UI**: Built with React and Tailwind CSS, featuring a beautiful dark-mode interface, glassmorphism components, and a highly responsive design.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Bootstrapped with Vite)
- **Styling**: Tailwind CSS & Vanilla CSS (Variables, Glassmorphism)
- **Icons**: Lucide React
- **State Management**: React Hooks & Custom Hooks (`useAnalyze`)

### Backend
- **Framework**: Node.js & Express
- **Database**: MySQL (using `mysql2/promise` with connection pooling)
- **AI Integration**: Groq SDK (LLaMA-3.3-70B model)
- **Security**: Basic IP Hashing for tracking

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Server (running locally or remotely)
- Groq API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd coachOS
   ```

2. **Database Setup:**
   Create a MySQL database and run the initial schema script:
   ```bash
   mysql -u root -p < backend/src/db/schema.sql
   ```

3. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=coachos_db
   PORT=3000
   GROQ_API_KEY=your_groq_api_key
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

4. **Frontend Setup:**
   Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

5. **Access the Application:**
   Open your browser and navigate to `http://localhost:5173`.

## 🧠 Architecture Overview

- **`Analyzer.jsx`**: The main interface where users input their queries, schemas, and custom EXPLAIN/Index data.
- **`analyzeController.js`**: Handles incoming requests, attempts to run a local `EXPLAIN` (if custom output isn't provided), and triggers the AI analysis.
- **`openaiService.js`**: Constructs a specialized prompt containing the query, schema, parsed execution stats, and indexes, sending it to the Groq API. It enforces a strict JSON response schema.
- **`mysqlService.js`**: Safely executes EXPLAIN queries against the local database using read-only transaction safeguards.

## 🎯 Purpose

This project was built to demonstrate proficiency in:
- **Full-Stack Engineering**: Seamlessly integrating a Node.js backend with a React frontend.
- **Database Architecture**: Understanding and parsing MySQL execution plans and indexes.
- **AI Integration**: Using prompt engineering to extract structured JSON data from Large Language Models for practical developer tools.
- **UI/UX Design**: Creating visually stunning, intuitive interfaces that feel premium and developer-friendly.
