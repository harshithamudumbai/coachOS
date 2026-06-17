# Dr.Query 🩺

> **Stop guessing why your database is slow.** Dr.Query is a deterministic SQL performance engine that catches missing indexes, full table scans, and bad architecture decisions before they crash your production environment. 

Database bottlenecks usually require hours of poring over raw `EXPLAIN` outputs or paying for expensive enterprise observability tools. Worse, when you ask an AI to fix your query, it often hallucinates invalid SQL or suggests indexes that don't actually help. 

Dr.Query exists to bridge this gap. We combine a **deterministic rule engine** with safe, isolated query benchmarking. By the time Dr.Query suggests an optimization, it has already tested it and proven the exact reduction in rows examined.

## ⚡ What Problem It Solves

Most developers only realize they have a database problem when users start complaining about slow page loads. Analyzing `mysql-slow.log` files is tedious, and reading raw `EXPLAIN` query plans feels like deciphering ancient hieroglyphs. 

Dr.Query automatically ingests your slow queries, parses their execution plans, flags anti-patterns (like hidden Cartesian joins or redundant indexes), and hands you a proven, benchmarked rewrite.

## ✨ Features

- **Deterministic Rule Engine:** Evaluates every query against 18 strict performance heuristics (e.g., `LARGE_ROW_EXAMINATION`, `PAGINATION_RISK`, `OR_CONDITION_EXPLOSION`).
- **Zero-Hallucination AI:** We restrict the LLM strictly to generating readable explanations. The actual severity scores and root causes are hardcoded by the rule engine to guarantee accuracy.
- **Auto-Benchmarking:** Dr.Query safely executes recommended rewrites in an isolated sandbox, calculating the precise `totalRowsExamined` reduction to prove the fix works.
- **Workload Forensics:** Upload a raw `mysql-slow.log` file, and Dr.Query will fingerprint the queries, aggregate execution frequencies, and highlight the top 5 worst offenders crashing your DB.
- **Index Redundancy Detection:** Automatically scans your schema to find strict left-prefix index redundancies, helping you safely drop useless indexes and reduce write overhead.

## 🛠️ How It Works

Dr.Query intercepts the raw `EXPLAIN FORMAT=JSON` output directly from MySQL. The deterministic engine then traverses the AST of the execution plan, searching for inefficiencies. 

If it detects an anti-pattern (like a function on an indexed column), it triggers a hardcoded rule. The engine then uses LLaMA 3.3 to format these strict findings into human-readable recommendations, automatically executing any suggested rewrites to validate their cost improvements.

## 🚀 Quick Start

The fastest way to evaluate Dr.Query is using our pre-configured Docker environment, which automatically spins up the frontend, backend, and a MySQL instance loaded with the **Sakila sample database**.

```bash
# Clone the repository
git clone https://github.com/yourusername/coachOS.git
cd coachOS

# Spin up the entire stack
docker compose up -d --build
```
*The app will be instantly available at `http://localhost:5173`.*

**Running locally without Docker:**
1. Configure your `.env` with `GROQ_API_KEY`, `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`.
2. Start the backend: `cd backend && npm start`
3. Start the frontend: `cd frontend && npm run dev`

## 📊 Example Usage & Benchmarks

Because Dr.Query automatically benchmarks its own suggestions, you can immediately see the impact. Here is a real-world benchmark intercepted by Dr.Query running against the Sakila database:

| Metric | Original Bad Query | Dr.Query Optimized | Impact |
|--------|-------------------|-----------------|--------|
| **Rows Examined** | 16,125 | 32 | **99.8% Reduction** |
| **Execution Cost** | 2.72 | 0.05 | **98.1% Improvement** |
| **Indexes Used** | None (Full Scan) | `idx_fk_customer_id` | **Resolved** |

*Original Query:* `SELECT * FROM sakila.payment WHERE customer_id + 0 = 1;`
*Optimized Query:* `SELECT * FROM sakila.payment WHERE customer_id = 1;`

## 📸 Screenshots & Architecture

![Architecture Diagram](./architecture.png)

*(UI Screenshots coming soon!)*

## 🗺️ Roadmap

- [ ] **PostgreSQL Support:** Expand the EXPLAIN parser to handle Postgres query plans.
- [ ] **Real-time Query Interception:** Connect directly to the MySQL general query log socket for live monitoring.
- [ ] **Automated Index Creation:** Generate and apply `CREATE INDEX` migrations securely.

## 🤝 Contributing

We welcome contributions! If you've found a new SQL anti-pattern that the deterministic engine should catch, please open a PR. 

1. Fork the repo.
2. Add your heuristic to `backend/src/services/analysisEngine.js`.
3. Ensure 100% test coverage on your new rule.
4. Submit a Pull Request.

## 📄 License

MIT License - feel free to use Dr.Query to save your production databases!
