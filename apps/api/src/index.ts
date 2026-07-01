import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { serve } from "@hono/node-server";
import notifyRouter from "./routes/notify.js";
import nlpRouter from "./routes/nlp.js";
import { initDb } from "./db.js";

const app = new Hono();

// Initialize DB schema & default developer API keys
initDb().catch((err) => {
  console.error("Database initialization failed on startup:", err);
});

// Global Middlewares
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "x-api-key", "Authorization"],
  }),
);
app.use("*", logger());
app.use("*", prettyJSON());

// Mount active sub-routers
app.route("/api/v1/notify", notifyRouter);
app.route("/notify", notifyRouter); // Direct mount fallback for frontend subscriber form
app.route("/api/v1/nlp", nlpRouter);

// Base health check & status endpoint (Industry Standard API Root)
app.get("/", (c) => {
  return c.json({
    name: "fidel-tools-api",
    description: "ፊደል (Fidel) Tools is a developer-first suite of high-performance natural language processing APIs built specifically for Ethiopic languages.",
    version: "0.1.9",
    status: "operational",
    documentation: "/docs",
    endpoints: {
      health: { path: "/", method: "GET", status: "active" },
      docs: { path: "/docs", method: "GET", status: "active" },
      languages: { path: "/api/v1/nlp/languages", method: "GET", status: "active" },
      pipeline: { path: "/api/v1/nlp/pipeline", method: "POST", status: "active" },
      normalize: { path: "/api/v1/nlp/normalize", method: "POST", status: "active" },
      tokenize: { path: "/api/v1/nlp/tokenize", method: "POST", status: "active" },
      stopwords: { path: "/api/v1/nlp/remove-stopwords", method: "POST", status: "active" },
      stem: { path: "/api/v1/nlp/stem", method: "POST", status: "active" },
      transliterate: { path: "/api/v1/nlp/transliterate", method: "POST", status: "active" },
      lexicalAnalyze: { path: "/api/v1/nlp/lexical-analyze", method: "POST", status: "active" },
      indexDocuments: { path: "/api/v1/nlp/index-documents", method: "POST", status: "active" },
      indexQuery: { path: "/api/v1/nlp/index-query", method: "POST", status: "active" },
      weighTerms: { path: "/api/v1/nlp/weigh-terms", method: "POST", status: "active" },
    },
  });
});

// Redirect /docs to the web application documentation page
app.get("/docs", (c) => {
  const host = c.req.header("host");
  // Default to localhost:3000 if running locally, otherwise use production domain
  const frontendUrl = process.env.FRONTEND_URL || (host?.includes("localhost") ? "http://localhost:3000" : "https://fidel.tools");
  return c.redirect(`${frontendUrl}/docs`);
});

// Unhandled error recovery handler
app.onError((err, c) => {
  console.error("Unhandled API Exception:", err);
  return c.json({ error: "Internal Server Error", message: err.message }, 500);
});

// Start serve instance
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log(`Server listening on port ${port}`);
serve({
  fetch: app.fetch,
  port,
});

export default app;
