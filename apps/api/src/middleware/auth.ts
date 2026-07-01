import type { MiddlewareHandler } from "hono";
import { pool } from "../db.js";

export const authenticateApiKey: MiddlewareHandler = async (c, next) => {
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
    const result = await pool.query("SELECT key, owner FROM api_keys WHERE key = $1", [apiKey]);

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
    c.set("apiKeyOwner", result.rows[0].owner);
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
