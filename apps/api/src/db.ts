import "dotenv/config";
import pg from "pg";
import crypto from "crypto";
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

    // Create users table matching Drizzle schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        email_verified BOOLEAN NOT NULL DEFAULT false,
        image TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        tier TEXT NOT NULL DEFAULT 'free',
        monthly_quota INTEGER NOT NULL DEFAULT 10000
      );
    `);

    // Create api_key_status enum type if it does not exist
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE api_key_status AS ENUM ('active', 'revoked');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create api_keys table matching Drizzle schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        key_hash TEXT UNIQUE NOT NULL,
        key_prefix TEXT NOT NULL,
        status api_key_status NOT NULL DEFAULT 'active',
        last_used_at TIMESTAMP,
        expires_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create internal_auth table
    await client.query(`
      CREATE TABLE IF NOT EXISTS internal_auth (
        id SERIAL PRIMARY KEY,
        passkey_hash TEXT UNIQUE NOT NULL,
        passphrase_hash TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create daily_puzzles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_puzzles (
        id SERIAL PRIMARY KEY,
        puzzle_id TEXT NOT NULL,
        date DATE NOT NULL,
        payload JSONB NOT NULL,
        day_number INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (puzzle_id, date)
      );
    `);

    // Seed default developer user
    await client.query(`
      INSERT INTO users (id, name, email) 
      VALUES ('default-developer', 'Default Developer', 'default@fidel.tools') 
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert a default API key for development/demo purposes
    const defaultKey = process.env.DEMO_API_KEY || "fidel_dev_key_2026";
    const hash = crypto.createHash("sha256").update(defaultKey).digest("hex");
    const prefix = defaultKey.slice(0, 10);

    const checkKey = await client.query("SELECT id FROM api_keys WHERE key_hash = $1", [hash]);
    if (checkKey.rowCount === 0) {
      await client.query(
        "INSERT INTO api_keys (user_id, name, key_hash, key_prefix) VALUES ($1, $2, $3, $4)",
        ["default-developer", "Default Developer Key", hash, prefix],
      );
      console.log(`Default API key generated and registered: ${defaultKey}`);
    }

    // Insert a dedicated API key for the lab application
    const labKey = process.env.LAB_API_KEY || "fidel_lab_key_2026";
    const labHash = crypto.createHash("sha256").update(labKey).digest("hex");
    const labPrefix = labKey.slice(0, 10);

    const checkLabKey = await client.query("SELECT id FROM api_keys WHERE key_hash = $1", [labHash]);
    if (checkLabKey.rowCount === 0) {
      await client.query(
        "INSERT INTO api_keys (user_id, name, key_hash, key_prefix) VALUES ($1, $2, $3, $4)",
        ["default-developer", "Lab Application Key", labHash, labPrefix],
      );
      console.log(`Lab application API key generated and registered: ${labKey}`);
    }

    // Seed internal passkey + passphrase
    const passkey = "fidel_passkey_2026_secure_key";
    const passphrase = "ethiopian_nlp_pipeline_is_running_smoothly";
    const passkeyHash = crypto.createHash("sha256").update(passkey).digest("hex");
    const passphraseHash = crypto.createHash("sha256").update(passphrase).digest("hex");

    const checkInternalCreds = await client.query("SELECT id FROM internal_auth WHERE passkey_hash = $1", [passkeyHash]);
    if (checkInternalCreds.rowCount === 0) {
      await client.query(
        "INSERT INTO internal_auth (passkey_hash, passphrase_hash) VALUES ($1, $2)",
        [passkeyHash, passphraseHash]
      );
      console.log("Internal auth credentials seeded successfully.");
    }

    console.log("Database tables initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize database:", err);
  } finally {
    client.release();
  }
}
