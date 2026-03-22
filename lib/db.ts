import { Pool } from "pg";

const pool = new Pool({
    connectionString:process.env.NEON_CONNECTION_STRING,
});

export default pool;
