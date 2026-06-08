# Dr.Query: AI-Powered SQL Performance Analyzer 🩺🚀

Dr.Query is a full-stack, AI-driven developer tool designed to automatically diagnose, explain, and optimize complex MySQL queries. Acting as a **Principal Database Performance Engineer**, Dr.Query provides proactive, actionable insights, bottlenecks detection, and intelligent rewriting suggestions to ensure your databases run at peak performance.

## ✨ Features

- **Automated Query Diagnostics**: Enter a query and schema, and Dr.Query will automatically execute an `EXPLAIN` to retrieve the database execution plan.
- **Principal DBA AI**: Leverages LLaMA 3 (via the Groq SDK) instructed to act as a Senior DBA. It automatically detects N+1 queries, missing indexes, `SELECT *` anti-patterns, pagination offsets, and row explosions.
- **Actionable Forensics**: Every recommendation includes exactly *why* the issue occurs, the *expected impact* in production, and the *exact SQL* to fix it.
- **Remote DB Support**: Need to analyze a production database? Simply paste your `SHOW INDEXES` and `EXPLAIN ANALYZE` output directly into the UI for external optimization without requiring local DB access.
- **Query History & Tracking**: Analyzed queries and their resulting AI insights are persisted in a local MySQL database for historical tracking and review.
- **Vintage Detective UI**: Built with React and Tailwind CSS, featuring a highly customized, brutalist "detective case file" aesthetic utilizing IBM Plex Serif and strict, flat architectural components.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Bootstrapped with Vite)
- **Styling**: Tailwind CSS & Vanilla CSS (Brutalist, Flat Panels, CSS Grid Backgrounds)
- **Typography**: IBM Plex Serif, JetBrains Mono
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

- **`Analyzer.jsx`**: The main interface where users input their queries, schemas, and custom EXPLAIN/Index evidence.
- **`analyzeController.js`**: Handles incoming requests, attempts to run a local `EXPLAIN`, and triggers the AI analysis.
- **`openaiService.js`**: Constructs a specialized, highly strict prompt forcing the AI into a Senior DBA persona, expecting a rigid JSON schema covering root causes, risks, and concrete fixes.
- **`ResultsDashboard.jsx`**: Parses the deeply nested AI response and maps it into a top-to-bottom Executive Summary and Investigation Findings report.

## 🎯 Purpose

This project was built to demonstrate proficiency in:
- **Full-Stack Engineering**: Seamlessly integrating a Node.js backend with a React frontend.
- **Database Architecture**: Understanding and parsing MySQL execution plans and indexes.
- **AI Integration**: Using prompt engineering to extract highly structured JSON data from Large Language Models for practical developer tools.
- **UI/UX Design**: Moving beyond generic SaaS templates to create highly custom, thematic, and immersive user experiences.
