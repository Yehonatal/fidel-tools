import type { MiddlewareHandler } from "hono";
import { pool } from "../db.js";
import crypto from "crypto";

export const authenticateApiKey: MiddlewareHandler = async (c, next) => {
  const passkey = c.req.header("x-passkey");
  const passphrase = c.req.header("x-passphrase");

  if (!passkey || !passphrase) {
    return c.json(
      {
        error: "Forbidden",
        message: "Missing internal passkey/passphrase headers. Live API access is locked for developer authentication.",
      },
      403,
    );
  }

  try {
    const pkHash = crypto.createHash("sha256").update(passkey).digest("hex");
    const ppHash = crypto.createHash("sha256").update(passphrase).digest("hex");

    const credsCheck = await pool.query(
      "SELECT id FROM internal_auth WHERE passkey_hash = $1 AND passphrase_hash = $2",
      [pkHash, ppHash]
    );

    if (credsCheck.rowCount === 0) {
      return c.json(
        {
          error: "Forbidden",
          message: "Invalid internal passkey/passphrase credentials. Access denied.",
        },
        403,
      );
    }
  } catch (err) {
    console.error("Internal credentials database check failed:", err);
    return c.json(
      {
        error: "Internal Server Error",
        message: "Failed to validate credentials.",
      },
      500,
    );
  }

  let apiKey = c.req.header("x-api-key");

  if (!apiKey) {
    const authHeader = c.req.header("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      apiKey = authHeader.substring(7).trim();
    }
  }

  if (!apiKey) {
    return c.json(
      {
        error: "Unauthorized",
        message:
          "Missing API key. Please provide the key in the 'x-api-key' header or as a Bearer token in the 'Authorization' header.",
      },
      401,
    );
  }

  try {
    const hash = crypto.createHash("sha256").update(apiKey).digest("hex");
    const result = await pool.query(
      "SELECT id, user_id, name FROM api_keys WHERE key_hash = $1 AND status = 'active'",
      [hash],
    );

    if (result.rowCount === 0) {
      return c.json(
        {
          error: "Unauthorized",
          message: "Invalid API key.",
        },
        401,
      );
    }

    // Store developer info in execution context for routing handlers
    c.set("apiKeyOwner", result.rows[0].user_id);
    c.set("apiKey", apiKey);
  } catch (err: any) {
    console.error("Authentication DB query failed:", err);
    return c.json(
      {
        error: "Internal Server Error",
        message: "Authentication validation failed.",
      },
      500,
    );
  }

  await next();
};
