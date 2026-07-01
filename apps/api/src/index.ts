import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { serve } from "@hono/node-server";
import { apiReference } from "@scalar/hono-api-reference";
import notifyRouter from "./routes/notify.js";
import nlpRouter from "./routes/nlp.js";
import { initDb } from "./db.js";

const app = new OpenAPIHono();

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
    description: "Production-ready OpenAPI-compliant API for Amharic NLP pre-processing",
    version: "0.1.6",
    status: "operational",
    documentation: "/docs",
    endpoints: {
      health: { path: "/", method: "GET", status: "active" },
      docs: { path: "/docs", method: "GET", status: "active" },
      openapi: { path: "/openapi.json", method: "GET", status: "active" },
    },
  });
});

// OpenAPI Spec Generation
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "ፊደል Tools API",
    version: "0.1.6",
    description:
      "ፊደል (Fidel) Tools is a developer-first suite of high-performance natural language processing APIs built specifically for Ethiopic languages. This reference provides interactive documentation for our production-grade NLP preprocessing endpoints (normalization, tokenization, stopword removal, morphological stemming, transliteration).",
  },
});

// Custom CSS styling for Scalar to align with Fidel Tools landing page design system
const customCss = `
  /* Fonts & Radius */
  :root {
    --scalar-font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --scalar-font-code: 'JetBrains Mono', 'Fira Code', monospace;
    --scalar-radius: 12px;
    --scalar-color-accent: #2563eb !important; /* Vibrant Blue Accent */
  }

`;

// Scalar Documentation
app.get("/docs", (c, next) => {
  const themeParam = c.req.query("theme") || "dark";
  const forceDarkModeState = themeParam === "light" ? "light" : "dark";
  return apiReference({
    spec: { url: "/openapi.json" },
    pageTitle: "ፊደል Tools API Reference",
    customCss,
    forceDarkModeState,
  })(c, next);
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
