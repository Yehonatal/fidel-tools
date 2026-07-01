import "dotenv/config";
import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("WARNING: DATABASE_URL is not set. Database operations will fail.");
}

const isLocal =
  !connectionString ||
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

export const pool = new Pool({
  connectionString,
  ssl: isLocal
    ? false
    : {
        rejectUnauthorized: false,
      },
});

export async function initDb() {
  const client = await pool.connect();
  try {
    // Create subscribers table
    await client.query(`
            CREATE TABLE IF NOT EXISTS subscribers (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

    // Create api_keys table
    await client.query(`
            CREATE TABLE IF NOT EXISTS api_keys (
                key VARCHAR(255) PRIMARY KEY,
                owner VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

    // Insert a default API key for development/demo purposes
    const defaultKey = process.env.DEMO_API_KEY || "fidel_dev_key_2026";
    const checkKey = await client.query("SELECT key FROM api_keys WHERE key = $1", [defaultKey]);
    if (checkKey.rowCount === 0) {
      await client.query("INSERT INTO api_keys (key, owner) VALUES ($1, $2)", [
        defaultKey,
        "default-developer",
      ]);
      console.log(`Default API key generated: ${defaultKey}`);
    }

    console.log("Database tables initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize database:", err);
  } finally {
    client.release();
  }
}
