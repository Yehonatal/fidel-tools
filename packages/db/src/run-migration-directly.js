import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

// Paths
const envPath = path.resolve("../../apps/web/.env.local");

if (!fs.existsSync(envPath)) {
  console.error("❌ apps/web/.env.local not found!");
  process.exit(1);
}

// Parse env file
const envContent = fs.readFileSync(envPath, "utf-8");
let databaseUrl = "";

for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*DATABASE_URL\s*=\s*["']?(.*?)["']?\s*$/);
  if (match) {
    databaseUrl = match[1];
    break;
  }
}

if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

console.log("Connecting directly to database...");
const sql = neon(databaseUrl);

// Dropping existing tables to avoid conflict with partially created schemas
const tablesToDrop = [
  "accounts",
  "api_keys",
  "sessions",
  "usage_aggregates",
  "usage_logs",
  "users",
  "verifications",
];

console.log("Cleaning up existing tables...");
for (const table of tablesToDrop) {
  try {
    await sql(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
    console.log(`Dropped table "${table}" (if existed)`);
  } catch (err) {
    console.warn(`Could not drop table "${table}":`, err.message);
  }
}

try {
  await sql(`DROP TYPE IF EXISTS "api_key_status" CASCADE;`);
  console.log('Dropped type "api_key_status" (if existed)');
} catch (err) {
  console.warn("Could not drop type:", err.message);
}

const sqlFilePath = path.resolve("./migrations/0000_thankful_titanium_man.sql");
if (!fs.existsSync(sqlFilePath)) {
  console.error("❌ Migration SQL file not found!");
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");

// Split by statement-breakpoint
const statements = sqlContent
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

console.log(`\nExecuting ${statements.length} migration statement(s) directly...`);

async function run() {
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`\n--- Executing statement ${i + 1}/${statements.length} ---`);
    console.log(stmt);
    await sql(stmt);
    console.log("✅ Success");
  }
  console.log("\n🎉 Database tables created successfully from scratch!");
}

run().catch((err) => {
  console.error("❌ Migration execution failed:", err);
  process.exit(1);
});
