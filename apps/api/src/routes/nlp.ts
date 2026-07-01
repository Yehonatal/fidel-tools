import { Hono } from "hono";
import { z } from "zod";
import { getPack, getPipeline, SUPPORTED_LANGS } from "../lang-registry.js";
import { authenticateApiKey } from "../middleware/auth.js";
import { apiRateLimiter } from "../middleware/rateLimiter.js";
import {
  normalize,
  sentenceTokenize,
  stem,
  removeStopwords,
  felig_transliterate,
  lexAnalyze,
  indexDocuments,
  indexQuery,
  weighTerms,
} from "@fidel-tools/core";

const nlpRouter = new Hono();

// Apply auth and rate limiting to all NLP endpoints
nlpRouter.use("*", authenticateApiKey);
nlpRouter.use("*", apiRateLimiter);

// Schemas
const commonSchema = z.object({
  text: z.string().min(1),
  lang: z.string().optional().default("am"),
});

const pipelineSchema = z.object({
  text: z.string().min(1),
  lang: z.string().optional().default("am"),
  steps: z
    .array(z.enum(["normalize", "tokenize", "stopwords", "stem"]))
    .optional()
    .default(["normalize", "tokenize", "stopwords", "stem"]),
  sequential: z.boolean().optional().default(false),
});

const stemSchema = z.object({
  word: z.string().optional(),
  words: z.array(z.string()).optional(),
  lang: z.string().optional().default("am"),
});

const transliterateSchema = z.object({
  text: z.string().min(1),
  direction: z.enum(["am", "en"]).optional().default("am"),
  type: z.enum(["felig", "sera"]).optional().default("felig"),
  lang: z.string().optional().default("am"),
});

const indexDocumentsSchema = z.object({
  docs: z
    .array(
      z.object({
        id: z.string(),
        content: z.string(),
      })
    )
    .min(1),
  lang: z.string().optional().default("am"),
});

const indexQuerySchema = z.object({
  query: z.string().min(1),
  lang: z.string().optional().default("am"),
});

const weighTermsSchema = z.object({
  index: z.any(),
  type: z.enum(["doc", "query"]),
});

// Helper for parsing JSON body and validating
async function parseAndValidate<T>(c: any, schema: z.Schema<T>): Promise<T | null> {
  try {
    const body = await c.req.json().catch(() => ({}));
    const parse = schema.safeParse(body);
    if (!parse.success) {
      return null;
    }
    return parse.data;
  } catch {
    return null;
  }
}

// 1. Get supported languages metadata
nlpRouter.get("/languages", (c) => {
  return c.json(
    {
      supported: SUPPORTED_LANGS,
      default: "am",
    },
    200,
  );
});

// 2. Custom execution Pipeline
nlpRouter.post("/pipeline", async (c) => {
  const data = await parseAndValidate(c, pipelineSchema);
  if (!data) {
    return c.json({ error: "Invalid request parameters" }, 400);
  }

  try {
    const { text, lang, steps, sequential } = data;
    const pack = await getPack(lang);

    if (sequential) {
      let current: any = text;
      for (const step of steps) {
        if (step === "normalize") {
          current = Array.isArray(current)
            ? current.map((w) => normalize(w, pack))
            : normalize(current, pack);
        } else if (step === "tokenize") {
          current = Array.isArray(current)
            ? current.flatMap((w) => w.split(/\s+/).filter(Boolean))
            : current.split(/\s+/).filter(Boolean);
        } else if (step === "stopwords") {
          current = Array.isArray(current)
            ? current.filter((w) => removeStopwords(w, pack).trim().length > 0)
            : removeStopwords(current, pack);
        } else if (step === "stem") {
          current = Array.isArray(current)
            ? current.map((w: string) => stem(w, pack))
            : current.split(/\s+/).filter(Boolean).map((w: string) => stem(w, pack)).join(" ");
        }
      }
      return c.json({ input: text, steps, result: current }, 200);
    }

    const result: {
      input: string;
      lang: string;
      normalized?: string;
      sentences?: string[];
      tokens?: string[];
      stopwordsRemoved?: string;
      stems?: string[];
    } = { input: text, lang };
    let current = text;

    if (steps.includes("normalize")) {
      current = normalize(current, pack);
      result.normalized = current;
    }
    if (steps.includes("tokenize")) {
      result.sentences = sentenceTokenize(current, pack);
      result.tokens = current.split(/\s+/).filter(Boolean);
    }
    if (steps.includes("stopwords")) {
      current = removeStopwords(current, pack);
      result.stopwordsRemoved = current;
    }
    if (steps.includes("stem")) {
      const tokenList = current.split(/\s+/).filter(Boolean);
      result.stems = tokenList.map((w) => stem(w, pack));
    }

    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ error: err.message || "Pipeline failed" }, 400);
  }
});

// 3. Normalizer
nlpRouter.post("/normalize", async (c) => {
  const data = await parseAndValidate(c, commonSchema);
  if (!data) {
    return c.json({ error: "Invalid request parameters" }, 400);
  }

  try {
    const { text, lang } = data;
    const pack = await getPack(lang);
    const result = normalize(text, pack);
    return c.json({ input: text, normalized: result, lang }, 200);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// 4. Tokenizer
nlpRouter.post("/tokenize", async (c) => {
  const data = await parseAndValidate(c, commonSchema);
  if (!data) {
    return c.json({ error: "Invalid request parameters" }, 400);
  }

  try {
    const { text, lang } = data;
    const pack = await getPack(lang);
    const sentences = sentenceTokenize(text, pack);
    const words = text.split(/\s+/).filter(Boolean);
    return c.json({ input: text, sentences, words, lang }, 200);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// 5. Remove Stopwords
nlpRouter.post("/remove-stopwords", async (c) => {
  const data = await parseAndValidate(c, commonSchema);
  if (!data) {
    return c.json({ error: "Invalid request parameters" }, 400);
  }

  try {
    const { text, lang } = data;
    const pack = await getPack(lang);
    const result = removeStopwords(text, pack);
    return c.json({ input: text, result, lang }, 200);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// 6. Morphological Stemmer
nlpRouter.post("/stem", async (c) => {
  const data = await parseAndValidate(c, stemSchema);
  if (!data) {
    return c.json({ error: "Invalid request parameters" }, 400);
  }

  try {
    const { word, words, lang } = data;
    const pack = await getPack(lang);

    if (word && typeof word === "string") {
      const stemmed = stem(word, pack);
      return c.json({ input: word, stem: stemmed, lang }, 200);
    } else if (Array.isArray(words)) {
      const stems = words.map((w) => ({
        word: w,
        stem: typeof w === "string" ? stem(w, pack) : null,
      }));
      return c.json({ stems, lang }, 200);
    }
    return c.json({ error: "Missing 'word' string or 'words' array in request body" }, 400);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// 7. Transliteration (Felig / SERA)
nlpRouter.post("/transliterate", async (c) => {
  const data = await parseAndValidate(c, transliterateSchema);
  if (!data) {
    return c.json({ error: "Invalid request parameters" }, 400);
  }

  try {
    const { text, direction, type, lang } = data;
    const pack = await getPack(lang);
    const result = felig_transliterate(text, direction === "en" ? "en" : "am", pack);

    return c.json(
      {
        input: text,
        direction,
        type,
        result,
        lang,
      },
      200,
    );
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// 8. Lexical Analyzer
nlpRouter.post("/lexical-analyze", async (c) => {
  const data = await parseAndValidate(c, commonSchema);
  if (!data) {
    return c.json({ error: "Invalid request parameters" }, 400);
  }

  try {
    const { text, lang } = data;
    const pack = await getPack(lang);
    const result = lexAnalyze(text, pack);
    return c.json({ input: text, result, lang }, 200);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// 9. Document Indexer
nlpRouter.post("/index-documents", async (c) => {
  const data = await parseAndValidate(c, indexDocumentsSchema);
  if (!data) {
    return c.json({ error: "Invalid request parameters" }, 400);
  }

  try {
    const { docs, lang } = data;
    const pack = await getPack(lang);
    const index = indexDocuments(docs, pack);
    return c.json({ index, lang }, 200);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// 10. Query Indexer
nlpRouter.post("/index-query", async (c) => {
  const data = await parseAndValidate(c, indexQuerySchema);
  if (!data) {
    return c.json({ error: "Invalid request parameters" }, 400);
  }

  try {
    const { query, lang } = data;
    const pack = await getPack(lang);
    const index = indexQuery(query, pack);
    return c.json({ index, lang }, 200);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// 11. Term Weighter
nlpRouter.post("/weigh-terms", async (c) => {
  const data = await parseAndValidate(c, weighTermsSchema);
  if (!data) {
    return c.json({ error: "Invalid request parameters" }, 400);
  }

  try {
    const { index, type } = data;
    const weights = weighTerms(index, type);
    return c.json({ weights }, 200);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

export default nlpRouter;
