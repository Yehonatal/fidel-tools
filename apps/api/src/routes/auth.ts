import { Hono } from "hono";
import crypto from "crypto";
import { sign } from "hono/jwt";
import { pool } from "../db.js";

const authRouter = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "fidel-default-jwt-secret-key-2026";

// ── 1. POST /token ─────────────────────────────────────────────────────────────
authRouter.post("/token", async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: "Invalid JSON body" }, 400);
  }

  const { passkey, passphrase } = body || {};

  if (!passkey || !passphrase) {
    return c.json(
      {
        error: "BadRequest",
        message: "Missing 'passkey' (API Key) or 'passphrase' in request body.",
      },
      400,
    );
  }

  try {
    // A. Validate passphrase against internal_auth
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

    // B. Validate API Key (passkey)
    const keyHash = crypto.createHash("sha256").update(passkey).digest("hex");
    
    // Check in api_keys table
    let apiKeyCheck = await pool.query(
      "SELECT id, user_id, name FROM api_keys WHERE key_hash = $1 AND status = 'active'",
      [keyHash]
    );

    let userId = "";
    let apiKeyId = null;

    if (apiKeyCheck.rowCount && apiKeyCheck.rowCount > 0) {
      userId = apiKeyCheck.rows[0].user_id;
      apiKeyId = apiKeyCheck.rows[0].id;
    } else {
      // Fallback: check internal_auth for original passkey match
      const checkInternalPasskey = await pool.query(
        "SELECT id FROM internal_auth WHERE passkey_hash = $1",
        [keyHash]
      );
      if (checkInternalPasskey.rowCount && checkInternalPasskey.rowCount > 0) {
        userId = "default-developer";
        // Leave apiKeyId null for internal passkey
      } else {
        return c.json(
          {
            error: "Unauthorized",
            message: "Invalid API key (passkey).",
          },
          401,
        );
      }
    }

    // C. Generate Access Token (JWT) expiring in 15 minutes
    const tokenPayload = {
      userId,
      apiKeyId,
      apiKey: passkey,
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
    };
    const accessToken = await sign(tokenPayload, JWT_SECRET);

    // D. Generate Refresh Token (UUID) expiring in 7 days
    const rawRefreshToken = crypto.randomUUID();
    const refreshHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO refresh_tokens (token_hash, user_id, api_key_id, expires_at) VALUES ($1, $2, $3, $4)",
      [refreshHash, userId, apiKeyId, refreshExpiresAt]
    );

    return c.json({
      accessToken,
      refreshToken: rawRefreshToken,
      expiresAt: tokenPayload.exp * 1000,
    });
  } catch (err) {
    console.error("Token exchange failed:", err);
    return c.json({ error: "Internal Server Error", message: "Failed to generate tokens." }, 500);
  }
});

// ── 2. POST /refresh ───────────────────────────────────────────────────────────
authRouter.post("/refresh", async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: "Invalid JSON body" }, 400);
  }

  const { refreshToken } = body || {};

  if (!refreshToken) {
    return c.json(
      {
        error: "BadRequest",
        message: "Missing 'refreshToken' in request body.",
      },
      400,
    );
  }

  try {
    const refreshHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    // Fetch and check refresh token
    const tokenCheck = await pool.query(
      "SELECT id, user_id, api_key_id, expires_at FROM refresh_tokens WHERE token_hash = $1",
      [refreshHash]
    );

    if (tokenCheck.rowCount === 0) {
      return c.json({ error: "Unauthorized", message: "Invalid refresh token." }, 401);
    }

    const { id, user_id, api_key_id, expires_at } = tokenCheck.rows[0];

    // Check expiration
    if (new Date(expires_at) < new Date()) {
      // Clean up expired token
      await pool.query("DELETE FROM refresh_tokens WHERE id = $1", [id]);
      return c.json({ error: "Unauthorized", message: "Refresh token has expired." }, 401);
    }

    // Fetch API key if present, otherwise default to internal passkey behavior
    let apiKeyVal = "fidel_passkey_2026_secure_key";
    if (api_key_id) {
      const apiKeyCheck = await pool.query(
        "SELECT key_hash, key_prefix FROM api_keys WHERE id = $1 AND status = 'active'",
        [api_key_id]
      );
      if (apiKeyCheck.rowCount === 0) {
        // If API key was revoked, revoke the refresh token too
        await pool.query("DELETE FROM refresh_tokens WHERE id = $1", [id]);
        return c.json({ error: "Unauthorized", message: "Associated API key has been revoked." }, 401);
      }
      // Reconstruct key fallback value or placeholder
      apiKeyVal = `ft_refreshed_${apiKeyCheck.rows[0].key_prefix}`;
    }

    // A. Rotate Refresh Token: Delete old one, create new one
    await pool.query("DELETE FROM refresh_tokens WHERE id = $1", [id]);

    const newRawRefreshToken = crypto.randomUUID();
    const newRefreshHash = crypto.createHash("sha256").update(newRawRefreshToken).digest("hex");
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO refresh_tokens (token_hash, user_id, api_key_id, expires_at) VALUES ($1, $2, $3, $4)",
      [newRefreshHash, user_id, api_key_id, refreshExpiresAt]
    );

    // B. Generate new Access Token (JWT)
    const tokenPayload = {
      userId: user_id,
      apiKeyId: api_key_id,
      apiKey: apiKeyVal,
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
    };
    const accessToken = await sign(tokenPayload, JWT_SECRET);

    return c.json({
      accessToken,
      refreshToken: newRawRefreshToken,
      expiresAt: tokenPayload.exp * 1000,
    });
  } catch (err) {
    console.error("Token refresh failed:", err);
    return c.json({ error: "Internal Server Error", message: "Failed to refresh tokens." }, 500);
  }
});

// ── 3. POST /revoke ────────────────────────────────────────────────────────────
authRouter.post("/revoke", async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: "Invalid JSON body" }, 400);
  }

  const { refreshToken } = body || {};

  if (!refreshToken) {
    return c.json(
      {
        error: "BadRequest",
        message: "Missing 'refreshToken' in request body.",
      },
      400,
    );
  }

  try {
    const refreshHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await pool.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [refreshHash]);
    return c.json({ success: true, message: "Token successfully revoked." });
  } catch (err) {
    console.error("Token revocation failed:", err);
    return c.json({ error: "Internal Server Error", message: "Failed to revoke token." }, 500);
  }
});

export default authRouter;
