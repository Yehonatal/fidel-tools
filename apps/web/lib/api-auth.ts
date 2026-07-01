import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { apiRateLimit, apiRateLimitPro } from "@/lib/rate-limit";
import { db, usageLogs, users } from "@fidel-tools/db";
import { eq } from "drizzle-orm";

export async function withApiAuth(
  req: NextRequest,
  handler: (userId: string, keyId: string) => Promise<NextResponse>,
): Promise<NextResponse> {
  const start = Date.now();
  const raw =
    req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace("Bearer ", "");

  if (!raw) {
    return NextResponse.json(
      { error: "Missing API key. Provide X-API-Key header." },
      { status: 401 },
    );
  }

  const { valid, userId, keyId } = await validateApiKey(raw);
  if (!valid || !userId || !keyId) {
    return NextResponse.json({ error: "Invalid or revoked API key." }, { status: 401 });
  }

  // Fetch user tier for rate limit selection
  const [user] = await db.select({ tier: users.tier }).from(users).where(eq(users.id, userId));
  const limiter = user?.tier === "pro" ? apiRateLimitPro : apiRateLimit;

  const { success, limit, remaining, reset } = await limiter.limit(userId);
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please slow down." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      },
    );
  }

  let response: NextResponse;
  try {
    response = await handler(userId, keyId);
  } catch (err) {
    console.error(err);
    response = NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // Log usage (fire-and-forget)
  db.insert(usageLogs)
    .values({
      apiKeyId: keyId,
      userId,
      endpoint: req.nextUrl.pathname,
      method: req.method,
      statusCode: response.status,
      latencyMs: Date.now() - start,
    })
    .catch(console.error);

  // Add rate limit headers to all responses
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(remaining));

  return response;
}
