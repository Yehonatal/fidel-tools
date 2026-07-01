import type { MiddlewareHandler } from "hono";
import { pool } from "../db.js";
import crypto from "crypto";
import { verify } from "hono/jwt";

export const authenticateApiKey: MiddlewareHandler = async (c, next) => {
  // A. Check for Bearer Token (JWT) in Authorization header
  const authHeader = c.req.header("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.substring(7).trim();
    try {
      const secret = process.env.JWT_SECRET || "fidel-default-jwt-secret-key-2026";
      const payload = await verify(token, secret, "HS256");
      if (payload && payload.userId) {
        c.set("apiKeyOwner", payload.userId as string);
        c.set("apiKey", (payload.apiKey as string) || "bearer_token");
        await next();
        return;
      }
    } catch (err: any) {
      console.warn("JWT validation failed:", err.message || err);
      return c.json(
        {
          error: "Unauthorized",
          message: "Token is invalid or expired.",
        },
        401,
      );
    }
  }

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
    const ppHash = crypto.createHash("sha256").update(passphrase).digest("hex");

    const credsCheck = await pool.query(
      "SELECT id FROM internal_auth WHERE passphrase_hash = $1",
      [ppHash]
    );

    if (credsCheck.rowCount === 0) {
      return c.json(
        {
          error: "Forbidden",
          message: "Invalid internal passphrase credentials. Access denied.",
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

  let apiKey = passkey;

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
          "Missing API key. Please provide the key in the 'x-passkey' header or as a Bearer token.",
      },
      401,
    );
  }

  try {
    const hash = crypto.createHash("sha256").update(apiKey).digest("hex");
    console.log(`[Auth Debug] Verifying API Key. Prefix: "${apiKey.slice(0, 10)}", Length: ${apiKey.length}, Hash: "${hash}"`);
    
    // 1. Check if it's a valid API key in the database
    let result = await pool.query(
      "SELECT id, user_id, name FROM api_keys WHERE key_hash = $1 AND status = 'active'",
      [hash],
    );

    if (result.rowCount === 0) {
      // 2. Fallback: Check if it matches the internal developer passkey
      const checkInternalPasskey = await pool.query(
        "SELECT id FROM internal_auth WHERE passkey_hash = $1",
        [hash]
      );
      if (checkInternalPasskey.rowCount && checkInternalPasskey.rowCount > 0) {
        result = {
          rowCount: 1,
          rows: [
            {
              id: "internal-developer-passkey",
              user_id: "default-developer",
              name: "Internal Developer Passkey",
            },
          ],
        } as any;
      }
    }

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
