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
      ALTER TABLE urls 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
    `);
    console.log("Migration successful: added password_hash column to urls.");
  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    pool.end();
  }
}
migrate();
