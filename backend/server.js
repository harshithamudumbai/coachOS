const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });

const { logger } = require('./src/lib/logger');
const { validateEnv } = require('./src/lib/validateEnv');

// Validate environment variables before doing anything else
validateEnv();

const app = require('./src/app');
const { testConnection } = require('./src/db/connection');
const workloadRoutes = require('./src/routes/workloadRoutes');

const PORT = process.env.PORT || 3001;

app.use('/api/workload', workloadRoutes);

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    logger.info(`Dr.Query backend running on port ${PORT}`, {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: PORT,
    });
  });
}

start();
