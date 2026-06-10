require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.NEON_CONNECTION_STRING });

pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'urls'")
  .then(res => console.log(res.rows))
  .catch(console.error)
  .finally(() => pool.end());
