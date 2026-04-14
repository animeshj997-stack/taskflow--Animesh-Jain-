const pkg = require('pg');
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
  max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
      rejectUnauthorized: false
  }
});

console.log(`host: ${process.env.DB_HOST}`);
console.log(`port: ${process.env.DB_PORT}`);
console.log(`database: ${process.env.DB_NAME}`);
console.log(`user: ${process.env.DB_USER}`);
console.log(`password: ${process.env.DB_PASSWORD}`);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
