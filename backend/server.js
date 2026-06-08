const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });
const app = require('./src/app');
const { testConnection } = require('./src/db/connection');
const workloadRoutes = require('./src/routes/workloadRoutes');

const PORT = process.env.PORT || 3001;

app.use('/api/workload', workloadRoutes);

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Dr.Query backend running on port ${PORT}`);
  });
}

start();
