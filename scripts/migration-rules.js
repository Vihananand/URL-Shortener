require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.NEON_CONNECTION_STRING });
async function migrate() {
  try {
    await pool.query('ALTER TABLE urls ADD COLUMN expires_at TIMESTAMP;');
    console.log('Added expires_at column');
  } catch (e) { console.log('expires_at might already exist or error: ', e.message); }
  try {
    await pool.query('ALTER TABLE urls ADD COLUMN max_clicks INTEGER;');
    console.log('Added max_clicks column');
  } catch (e) { console.log('max_clicks might already exist or error: ', e.message); }
}
migrate().finally(() => pool.end());
