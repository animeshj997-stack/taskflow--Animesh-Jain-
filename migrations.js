const fs = require('fs');
const path = require('path');
const pool = require('./src/db/pool');

const migrationsDir = path.join(__dirname, 'src', 'db', 'migrations');

async function runMigrations() {
  const client = await pool.connect();
  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Get all migration files (only up migrations, ending with .sql but not _down.sql)
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql') && !f.endsWith('_down.sql'))
      .sort();

    for (const file of files) {
      const result = await client.query(
        'SELECT id FROM migrations WHERE name = $1',
        [file]
      );

      if (result.rows.length === 0) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        
        await client.query(sql);
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file]
        );
        
        console.log(`✓ Executed migration: ${file}`);
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = runMigrations;
