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
      ADD COLUMN IF NOT EXISTS is_virus_total_scan_enabled BOOLEAN DEFAULT TRUE;
    `);
    console.log("Migration successful: added is_virus_total_scan_enabled column.");
  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    pool.end();
  }
}
migrate();
