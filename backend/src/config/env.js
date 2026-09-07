require('dotenv').config();

const requiredEnv = [
  'DATABASE_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

function validateEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[CONFIG ERROR] Missing required environment variables: ${missing.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  if (process.env.JWT_SECRET === 'replace_with_a_long_random_string' && process.env.NODE_ENV === 'production') {
    console.error('[CONFIG ERROR] Do not use the default placeholder JWT_SECRET in production!');
    process.exit(1);
  }
}

validateEnv();

module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'dev_fallback_secret',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  FRONTEND_URL: (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, ''),
};

