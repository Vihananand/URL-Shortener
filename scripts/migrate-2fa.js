const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING,
});

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS two_factor_method VARCHAR(50),
      ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(255);
    `);
    console.log("Migration successful: added 2FA columns.");
  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    pool.end();
  }
}

migrate();
