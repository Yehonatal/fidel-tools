import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getPack, getPipeline, SUPPORTED_LANGS } from "../lang-registry.js";
import { authenticateApiKey } from "../middleware/auth.js";
import { apiRateLimiter } from "../middleware/rateLimiter.js";
import {
  normalize,
  sentenceTokenize,
  stem,
  removeStopwords,
  felig_transliterate,
} from "@fidel-tools/core";

const nlpRouter = new OpenAPIHono();

// Apply auth and rate limiting to all NLP endpoints
nlpRouter.use("*", authenticateApiKey);
nlpRouter.use("*", apiRateLimiter);

// 1. Get supported languages metadata
const languagesRoute = createRoute({
  method: "get",
  path: "/languages",
  tags: ["NLP Tools"],
  summary: "Get supported languages",
  description: "Returns a list of supported language codes and the default language pack.",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            supported: z.array(z.string()).openapi({ example: ["am"] }),
            default: z.string().openapi({ example: "am" }),
          }),
        },
      },
      description: "Supported languages retrieved successfully",
    },
  },
});

nlpRouter.openapi(languagesRoute, (c) => {
  return c.json(
    {
      supported: SUPPORTED_LANGS,
      default: "am",
    },
    200,
  );
});

// 2. Custom execution Pipeline
const pipelineRoute = createRoute({
  method: "post",
  path: "/pipeline",
  tags: ["NLP Tools"],
  summary: "Execute NLP pipeline steps",
  description: "Runs configurable NLP steps (normalize, tokenize, stopwords, stem) on input text.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            text: z
              .string()
              .min(1)
              .openapi({ description: "Input text to process", example: "ልጆች በኢትዮጵያ" }),
            lang: z
              .string()
              .optional()
              .default("am")
              .openapi({ description: "Language code", example: "am" }),
            steps: z
              .array(z.enum(["normalize", "tokenize", "stopwords", "stem"]))
              .optional()
              .default(["normalize", "tokenize", "stopwords", "stem"])
              .openapi({ description: "Pipeline steps to execute" }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            input: z.string().openapi({ example: "ልጆች በኢትዮጵያ" }),
            lang: z.string().openapi({ example: "am" }),
            normalized: z.string().optional().openapi({ example: "ልጆች በኢትዮጵያ" }),
            sentences: z
              .array(z.string())
              .optional()
              .openapi({ example: ["ልጆች በኢትዮጵያ"] }),
            tokens: z
              .array(z.string())
              .optional()
              .openapi({ example: ["ልጆች", "በኢትዮጵያ"] }),
            stopwordsRemoved: z.string().optional().openapi({ example: "ልጆች ኢትዮጵያ" }),
            stems: z
              .array(z.string())
              .optional()
              .openapi({ example: ["ልጅ", "ኢትዮጵያ"] }),
          }),
        },
      },
      description: "Pipeline steps executed successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({ example: "Invalid request parameters" }),
          }),
        },
      },
      description: "Invalid input parameters",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({ example: "Internal server error occurred" }),
          }),
        },
      },
      description: "Internal server error",
    },
  },
});

nlpRouter.openapi(pipelineRoute, async (c) => {
  try {
    const {
      text,
      lang = "am",
      steps = ["normalize", "tokenize", "stopwords", "stem"],
    } = c.req.valid("json");

    const pack = await getPack(lang);
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
const normalizeRoute = createRoute({
  method: "post",
  path: "/normalize",
  tags: ["NLP Tools"],
  summary: "Normalize Ethiopic text",
  description:
    "Standardizes Ethiopic characters, maps variants to standard characters, and cleans text.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            text: z
              .string()
              .min(1)
              .openapi({ description: "Input text to normalize", example: "ሃይማኖት" }),
            lang: z
              .string()
              .optional()
              .default("am")
              .openapi({ description: "Language code", example: "am" }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            input: z.string().openapi({ example: "ሃይማኖት" }),
            normalized: z.string().openapi({ example: "ሃይማኖት" }),
            lang: z.string().openapi({ example: "am" }),
          }),
        },
      },
      description: "Text normalized successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({ example: "Invalid request parameters" }),
          }),
        },
      },
      description: "Invalid input parameters",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({ example: "Internal server error occurred" }),
          }),
        },
      },
      description: "Internal server error",
    },
  },
});

nlpRouter.openapi(normalizeRoute, async (c) => {
  try {
    const { text, lang = "am" } = c.req.valid("json");
    const pack = await getPack(lang);
    const result = normalize(text, pack);
    return c.json({ input: text, normalized: result, lang }, 200);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// 4. Tokenizer
const tokenizeRoute = createRoute({
  method: "post",
  path: "/tokenize",
  tags: ["NLP Tools"],
  summary: "Tokenize text into sentences/words",
  description: "Segments the input corpus into sentences and lists of words.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            text: z
              .string()
              .min(1)
              .openapi({ description: "Input text to tokenize", example: "ፊደል ቱልስ። በጣም ጥሩ ነው።" }),
            lang: z
              .string()
              .optional()
              .default("am")
              .openapi({ description: "Language code", example: "am" }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            input: z.string().openapi({ example: "ፊደል ቱልስ። በጣም ጥሩ ነው።" }),
            sentences: z.array(z.string()).openapi({ example: ["ፊደል ቱልስ።", "በጣም ጥሩ ነው።"] }),
            words: z.array(z.string()).openapi({ example: ["ፊደል", "ቱልስ።", "በጣም", "ጥሩ", "ነው።"] }),
            lang: z.string().openapi({ example: "am" }),
          }),
        },
      },
      description: "Text tokenized successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({ example: "Invalid request parameters" }),
          }),
        },
      },
      description: "Invalid input parameters",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({ example: "Internal server error occurred" }),
          }),
        },
      },
      description: "Internal server error",
    },
  },
});

nlpRouter.openapi(tokenizeRoute, async (c) => {
  try {
    const { text, lang = "am" } = c.req.valid("json");
    const pack = await getPack(lang);
    const sentences = sentenceTokenize(text, pack);
    const words = text.split(/\s+/).filter(Boolean);
    return c.json({ input: text, sentences, words, lang }, 200);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// 5. Remove Stopwords
const removeStopwordsRoute = createRoute({
  method: "post",
  path: "/remove-stopwords",
  tags: ["NLP Tools"],
  summary: "Remove stop words from text",
  description:
    "Strips out common functional words (such as prepositions and conjunctions) based on the language pack rules.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            text: z
              .string()
              .min(1)
              .openapi({ description: "Input text", example: "ይህ ልጅ በጣም ጎበዝ ነው" }),
            lang: z
              .string()
              .optional()
              .default("am")
              .openapi({ description: "Language code", example: "am" }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            input: z.string().openapi({ example: "ይህ ልጅ በጣም ጎበዝ ነው" }),
            result: z.string().openapi({ example: "ልጅ በጣም ጎበዝ" }),
            lang: z.string().openapi({ example: "am" }),
          }),
        },
      },
      description: "Stopwords removed successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({ example: "Invalid request parameters" }),
          }),
        },
      },
      description: "Invalid input parameters",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({ example: "Internal server error occurred" }),
          }),
        },
      },
      description: "Internal server error",
    },
  },
});

nlpRouter.openapi(removeStopwordsRoute, async (c) => {
  try {
    const { text, lang = "am" } = c.req.valid("json");
    const pack = await getPack(lang);
    const result = removeStopwords(text, pack);
    return c.json({ input: text, result, lang }, 200);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// 6. Morphological Stemmer
const stemRoute = createRoute({
  method: "post",
  path: "/stem",
  tags: ["NLP Tools"],
  summary: "Stem Amharic words",
  description:
    "Extracts root stems from an individual word or a list of words using affix-removal algorithms.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            word: z
              .string()
              .optional()
              .openapi({ description: "Single word to stem", example: "ልጆቻቸውን" }),
            words: z
              .array(z.string())
              .optional()
              .openapi({ description: "List of words to stem", example: ["ወንበሮች", "ቤቶች"] }),
            lang: z
              .string()
              .optional()
              .default("am")
              .openapi({ description: "Language code", example: "am" }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            input: z.string().optional().openapi({ example: "ልጆቻቸውን" }),
            stem: z.string().optional().openapi({ example: "ልጅ" }),
            stems: z
              .array(
                z.object({
                  word: z.string().openapi({ example: "ልጆቻቸውን" }),
                  stem: z.string().nullable().openapi({ example: "ልጅ" }),
                }),
              )
              .optional()
              .openapi({
                example: [
                  { word: "ወንበሮች", stem: "ወንበር" },
                  { word: "ቤቶች", stem: "ቤት" },
                ],
              }),
            lang: z.string().openapi({ example: "am" }),
          }),
        },
      },
      description: "Stemming completed successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({ example: "Invalid request parameters" }),
          }),
        },
      },
      description: "Invalid input parameters",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({ example: "Internal server error occurred" }),
          }),
        },
      },
      description: "Internal server error",
    },
  },
});

nlpRouter.openapi(stemRoute, async (c) => {
  try {
    const { word, words, lang = "am" } = c.req.valid("json");
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
const transliterateRoute = createRoute({
  method: "post",
  path: "/transliterate",
  tags: ["NLP Tools"],
  summary: "Transliterate Ethiopic text",
  description:
    "Converts text between Amharic (Ge'ez) and English characters using Felig or SERA transliteration systems.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            text: z
              .string()
              .min(1)
              .openapi({ description: "Text to transliterate", example: "ኢትዮጵያ" }),
            direction: z
              .enum(["am", "en"])
              .optional()
              .default("am")
              .openapi({
                description:
                  "Target alphabet direction ('am' for Ge'ez output, 'en' for English Latin output)",
              }),
            type: z
              .enum(["felig", "sera"])
              .optional()
              .default("felig")
              .openapi({ description: "Transliteration system/engine engine to use" }),
            lang: z
              .string()
              .optional()
              .default("am")
              .openapi({ description: "Language code", example: "am" }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            input: z.string().openapi({ example: "ኢትዮጵያ" }),
            direction: z.string().openapi({ example: "am" }),
            type: z.string().openapi({ example: "felig" }),
            result: z.string().openapi({ example: "ityop'ya" }),
            lang: z.string().openapi({ example: "am" }),
          }),
        },
      },
      description: "Text transliterated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({ example: "Invalid request parameters" }),
          }),
        },
      },
      description: "Invalid input parameters",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({ example: "Internal server error occurred" }),
          }),
        },
      },
      description: "Internal server error",
    },
  },
});

nlpRouter.openapi(transliterateRoute, async (c) => {
  try {
    const { text, direction = "am", type = "felig", lang = "am" } = c.req.valid("json");
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

export default nlpRouter;
