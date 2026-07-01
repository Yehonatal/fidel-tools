import { Hono } from "hono";
import { pool } from "../db.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { z } from "zod";

const notifyRouter = new Hono();

// Apply public rate limiter to subscription requests: maximum 10 submissions per minute per IP address
notifyRouter.use(
  "/",
  rateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    keyGenerator: (c) => {
      const forwarded = c.req.header("x-forwarded-for");
      if (forwarded) {
        return forwarded.split(",")[0].trim();
      }
      return "ip-unknown";
    },
  }),
);

// Subscribe route: standard validation via standard Zod schema parser (not exposed to OpenAPI/Scalar)
notifyRouter.post("/", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const schema = z.object({
      email: z.string().email(),
    });

    const parseResult = schema.safeParse(body);
    if (!parseResult.success) {
      return c.json({ error: "Invalid email address" }, 400);
    }

    const { email } = parseResult.data;
    const emailLower = email.trim().toLowerCase();

    // Insert email into PostgreSQL database, avoiding duplicates via ON CONFLICT
    await pool.query("INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING", [
      emailLower,
    ]);

    return c.json({ success: true, message: "Subscribed successfully" }, 200);
  } catch (error: any) {
    console.error("Subscription endpoint error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default notifyRouter;
