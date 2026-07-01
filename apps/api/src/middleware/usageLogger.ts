import { MiddlewareHandler } from "hono";
import { pool } from "../db.js";

export const logUsage: MiddlewareHandler = async (c, next) => {
  const start = Date.now();

  // Process the request
  await next();

  // Run usage logging asynchronously (fire-and-forget) to not block the response
  const userId = c.get("apiKeyOwner");
  const apiKeyId = c.get("apiKeyId");

  if (!userId) {
    return; // Don't log if the request is not authenticated
  }

  const endpoint = c.req.path;
  const method = c.req.method;
  const statusCode = c.res.status;
  const latencyMs = Date.now() - start;

  // Clone request body to count tokens processed without interfering with the main stream
  let tokensProcessed = 0;
  try {
    const clonedReq = c.req.raw.clone();
    const body = await clonedReq.json().catch(() => null);
    if (body) {
      if (typeof body.text === "string") {
        tokensProcessed = body.text.split(/\s+/).filter(Boolean).length;
      } else if (typeof body.query === "string") {
        tokensProcessed = body.query.split(/\s+/).filter(Boolean).length;
      } else if (typeof body.word === "string") {
        tokensProcessed = 1;
      } else if (Array.isArray(body.words)) {
        tokensProcessed = body.words.length;
      } else if (Array.isArray(body.docs)) {
        tokensProcessed = body.docs.reduce((acc: number, doc: any) => {
          if (doc && typeof doc.content === "string") {
            return acc + doc.content.split(/\s+/).filter(Boolean).length;
          }
          return acc;
        }, 0);
      }
    }
  } catch {
    // Ignore parsing issues (e.g. GET requests or non-JSON payloads)
  }

  // Insert log to database using parameterized query
  pool.query(
    `INSERT INTO usage_logs (api_key_id, user_id, endpoint, method, status_code, latency_ms, tokens_processed)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      apiKeyId && apiKeyId !== "internal-developer-passkey" ? apiKeyId : null,
      userId,
      endpoint,
      method,
      statusCode,
      latencyMs,
      tokensProcessed,
    ]
  ).catch((err) => {
    console.error(`[Usage Logger Error] Failed to write usage log for user "${userId}":`, err);
  });
};
