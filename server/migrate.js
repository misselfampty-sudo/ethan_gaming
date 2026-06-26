// Database migration script — run once to set up schema
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arcade',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  try {
    console.log('Creating tables...');

    // Profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(12) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version INT DEFAULT 1
      );
    `);

    // High scores table (last-write-wins with timestamps)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS high_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        game_id VARCHAR(50) NOT NULL,
        score INT NOT NULL DEFAULT 0,
        level INT NOT NULL DEFAULT 1,
        score_timestamp BIGINT NOT NULL,
        server_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version INT DEFAULT 1,
        UNIQUE(profile_id, game_id)
      );
    `);

    // Sync log (for debugging and audit trail)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sync_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL,
        client_timestamp BIGINT,
        server_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        details JSONB
      );
    `);

    console.log('✅ Tables created successfully');
    await pool.end();
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();
