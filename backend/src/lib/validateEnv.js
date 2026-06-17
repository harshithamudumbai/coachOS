const { logger } = require('./logger');

/**
 * Validates that all required environment variables are present at startup.
 * Fails fast with a clear error if any are missing.
 */
function validateEnv() {
  const required = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'GROQ_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    console.error(
      `\n❌ FATAL: Missing required environment variables:\n   ${missing.join(', ')}\n\n   Copy .env.example to .env and fill in all values.\n`
    );
    process.exit(1);
  }

  // Warn if FRONTEND_URL is not set (CORS will be restrictive)
  if (!process.env.FRONTEND_URL) {
    logger.warn('FRONTEND_URL not set — CORS will reject all cross-origin requests in production');
  }

  // Safety check: ensure no server secrets are accidentally exposed via VITE_ prefix
  const leakedSecrets = Object.keys(process.env).filter(
    (key) => key.startsWith('VITE_') && /key|secret|password|token/i.test(key)
  );
  if (leakedSecrets.length > 0) {
    logger.error('Potential secret leak via VITE_ prefix', { keys: leakedSecrets });
    console.error(
      `\n❌ FATAL: Environment variables with VITE_ prefix may be exposed to the client:\n   ${leakedSecrets.join(', ')}\n\n   Rename these variables to remove the VITE_ prefix.\n`
    );
    process.exit(1);
  }

  logger.info('Environment validation passed');
}

module.exports = { validateEnv };
