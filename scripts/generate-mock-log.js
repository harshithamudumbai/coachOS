const fs = require('fs');

const patterns = [
  {
    template: (i) => `SELECT * FROM users WHERE status = 'pending' AND created_at > '2025-01-${String(i%28+1).padStart(2,'0')}';`,
    weight: 2000,
    baseQueryTime: 2.5,
    baseRowsExamined: 1500000
  },
  {
    template: (i) => `SELECT id FROM events WHERE YEAR(event_date) = 2025;`,
    weight: 1500,
    baseQueryTime: 1.8,
    baseRowsExamined: 800000
  },
  {
    template: (i) => {
      const ids = Array.from({length: 150}, (_, idx) => idx + i).join(',');
      return `SELECT * FROM products WHERE id IN (${ids});`;
    },
    weight: 800,
    baseQueryTime: 3.2,
    baseRowsExamined: 5000
  },
  {
    template: (i) => `SELECT * FROM orders ORDER BY total_amount DESC LIMIT ${10000 + i}, 20;`,
    weight: 500,
    baseQueryTime: 4.5,
    baseRowsExamined: 2000000
  },
  {
    template: (i) => `SELECT * FROM active_sessions;`,
    weight: 200,
    baseQueryTime: 0.8,
    baseRowsExamined: 50000
  }
];

let logContent = '';
const totalExecutions = 5000;

for (let i = 0; i < totalExecutions; i++) {
  // Pick a pattern based on weight roughly
  const rand = Math.random() * 5000;
  let selected = patterns[4];
  if (rand < 2000) selected = patterns[0];
  else if (rand < 3500) selected = patterns[1];
  else if (rand < 4300) selected = patterns[2];
  else if (rand < 4800) selected = patterns[3];

  const query = selected.template(i);
  const qTime = (selected.baseQueryTime + (Math.random() * 0.5)).toFixed(6);
  const rExamined = selected.baseRowsExamined + Math.floor(Math.random() * 1000);
  
  const timestamp = new Date(1717864200000 + i * 10000).toISOString();

  logContent += `# Time: ${timestamp}\n`;
  logContent += `# User@Host: admin[admin] @ localhost [127.0.0.1]\n`;
  logContent += `# Query_time: ${qTime}  Lock_time: 0.000000 Rows_sent: 10  Rows_examined: ${rExamined}\n`;
  logContent += `SET timestamp=${Math.floor(Date.now()/1000)};\n`;
  logContent += `${query}\n\n`;
}

fs.writeFileSync('demo-workload.log', logContent);
console.log('Successfully generated demo-workload.log with 5000 executions.');
