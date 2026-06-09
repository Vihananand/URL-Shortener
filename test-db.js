require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.NEON_CONNECTION_STRING });

pool.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'users'")
  .then(res => {
    console.log(res.rows);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
