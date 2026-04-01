// Test database connection
import { Pool } from "pg";

const connectionString = process.env.NEON_CONNECTION_STRING;

if (!connectionString) {
  console.error("❌ NEON_CONNECTION_STRING not set in .env");
  process.exit(1);
}

console.log("🔗 Testing database connection...");
console.log(`📍 Hostname: ${new URL(connectionString).hostname}`);

const pool = new Pool({
  connectionString: connectionString,
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Connection failed:", err.message);
    console.error("   Code:", err.code);
    process.exit(1);
  }

  console.log("✅ Connection successful!");
  console.log(`📅 Server time: ${res.rows[0].now}`);

  pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
    (err, res) => {
      if (err) {
        console.error("❌ Query failed:", err.message);
        process.exit(1);
      }

      console.log("\n📊 Tables in database:");
      if (res.rows.length === 0) {
        console.log("   ⚠️  No tables found! Run setup.sql");
      } else {
        res.rows.forEach((row) => {
          console.log(`   ✓ ${row.table_name}`);
        });
      }

      pool.end();
    }
  );
});
