import type { MiddlewareHandler } from "hono";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const stores: { [windowMs: number]: RateLimitStore } = {};

export function rateLimiter(options: {
  windowMs: number;
  max: number;
  keyGenerator: (c: any) => string;
}): MiddlewareHandler {
  const { windowMs, max, keyGenerator } = options;

  if (!stores[windowMs]) {
    stores[windowMs] = {};
  }
  const store = stores[windowMs];

  return async (c, next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
    } else {
      store[key].count++;
    }

    const current = store[key].count;
    const reset = store[key].resetTime;

    // Set standard rate limit headers on response
    c.header("X-RateLimit-Limit", max.toString());
    c.header("X-RateLimit-Remaining", Math.max(0, max - current).toString());
    c.header("X-RateLimit-Reset", Math.ceil(reset / 1000).toString());

    if (current > max) {
      return c.json(
        {
          error: "Too Many Requests",
          message: `You have exceeded the rate limit of ${max} requests per ${windowMs / (60 * 60 * 1000)} hour(s).`,
        },
        429,
      );
    }

    await next();
  };
}

function getClientIp(c: any): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "ip-unknown";
}

// Demo Limit: 2 requests per endpoint per hour per IP
const demoLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 2,
  keyGenerator: (c) => {
    const ip = getClientIp(c);
    const path = c.req.path;
    return `demo:${ip}:${path}`;
  },
});

// Standard Limit: 100 requests per endpoint per hour per API Key
const standardLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 100,
  keyGenerator: (c) => {
    const apiKey = c.get("apiKey") || "no-key";
    const path = c.req.path;
    return `standard:${apiKey}:${path}`;
  },
});

export const apiRateLimiter: MiddlewareHandler = async (c, next) => {
  const apiKey = c.get("apiKey");
  const demoKey = process.env.DEMO_API_KEY || "fidel_dev_key_2026";
  if (apiKey === demoKey) {
    return demoLimiter(c, next);
  }
  return standardLimiter(c, next);
};
