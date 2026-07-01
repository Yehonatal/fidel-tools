import { Hono } from "hono";
import { pool } from "../db.js";
import { getPack } from "../lang-registry.js";
import {
  indexDocuments,
  indexQuery,
  weighTerms,
  normalize,
  sentenceTokenize,
  removeStopwords,
  stem,
} from "@fidel-tools/core";
import fs from "fs";
import path from "path";

const puzzleRouter = new Hono();

// Curated corpus readers
function getCorpus(filename: string): any[] {
  try {
    const filePath = path.join(process.cwd(), "data/corpus", filename);
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Failed to read corpus file ${filename}:`, err);
    return [];
  }
}

// Deterministic Date-based seeding
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromDate(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (Math.imul(31, h) + dateStr.charCodeAt(i)) | 0;
  }
  return h;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// UTC day number calculation from launch epoch (2026-07-01)
function getDayNumber(dateStr: string): number {
  const epoch = new Date("2026-07-01T00:00:00Z");
  const current = new Date(`${dateStr}T00:00:00Z`);
  const diffTime = current.getTime() - epoch.getTime();
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, days + 1); // 2026-07-01 is Day 1
}

// Helper to run pipeline steps in exact order
function runSequential(text: string, steps: string[], pack: any): string | string[] {
  let current: any = text;
  for (const step of steps) {
    if (step === "normalize") {
      current = Array.isArray(current)
        ? current.map((w) => normalize(w, pack))
        : normalize(current, pack);
    } else if (step === "tokenize") {
      current = Array.isArray(current)
        ? current.flatMap((w: string) => w.split(/\s+/).filter(Boolean))
        : current.split(/\s+/).filter(Boolean);
    } else if (step === "stopwords") {
      current = Array.isArray(current)
        ? current.filter((w: string) => removeStopwords(w, pack).trim().length > 0)
        : removeStopwords(current, pack);
    } else if (step === "stem") {
      current = Array.isArray(current)
        ? current.map((w: string) => stem(w, pack))
        : current.split(/\s+/).filter(Boolean).map((w: string) => stem(w, pack)).join(" ");
    }
  }
  return current;
}

function formatOutput(res: string | string[]): string {
  if (Array.isArray(res)) {
    return res.join(" · ");
  }
  return res;
}

// Trace permutation list helper
const ALL_STEPS = ["normalize", "tokenize", "stopwords", "stem"];
function getPermutations(arr: string[], length: number): string[][] {
  if (length === 1) return arr.map((x) => [x]);
  const results: string[][] = [];
  arr.forEach((item, index) => {
    const remaining = arr.filter((_, i) => i !== index);
    const subPerms = getPermutations(remaining, length - 1);
    subPerms.forEach((sub) => {
      results.push([item, ...sub]);
    });
  });
  return results;
}
const ALL_PERMUTATIONS_3 = getPermutations(ALL_STEPS, 3);
const ALL_PERMUTATIONS_4 = getPermutations(ALL_STEPS, 4);
const ALL_PERMUTATIONS = [...ALL_PERMUTATIONS_3, ...ALL_PERMUTATIONS_4];

// Relevance Arena Route
puzzleRouter.get("/daily/relevance-arena", async (c) => {
  try {
    // Get date param, fallback to current UTC date
    const reqDate = c.req.query("date");
    const dateStr = reqDate || new Date().toISOString().split("T")[0];

    const puzzleId = "relevance-arena";
    const dayNumber = getDayNumber(dateStr);

    // 1. Check database cache
    const cachedQuery = await pool.query(
      "SELECT payload FROM daily_puzzles WHERE puzzle_id = $1 AND date = $2",
      [puzzleId, dateStr]
    );

    if (cachedQuery.rowCount && cachedQuery.rowCount > 0) {
      return c.json({
        puzzle_id: puzzleId,
        date: dateStr,
        day_number: dayNumber,
        payload: cachedQuery.rows[0].payload,
      });
    }

    // 2. Generate on-first-request
    const corpus = getCorpus("relevance-arena.json");
    if (corpus.length === 0) {
      return c.json({ error: "Relevance Arena corpus is empty or missing" }, 500);
    }

    const seed = seedFromDate(dateStr + ":relevance-arena");
    const shuffledCorpus = seededShuffle(corpus, seed);
    
    // Pick first 5 items for the 5 rounds of the daily puzzle
    const roundsToProcess = shuffledCorpus.slice(0, 5);
    const pack = await getPack("am");

    const computedRounds = roundsToProcess.map((item, roundIdx) => {
      const docs = [
        { id: "A", content: item.passageA },
        { id: "B", content: item.passageB },
      ];

      const docsIndex = indexDocuments(docs, pack);
      const queryIndex = indexQuery(item.query, pack);
      const queryWeights = weighTerms(queryIndex, "query");
      const docWeights = weighTerms(docsIndex, "doc");

      let scoreA = 0;
      let scoreB = 0;
      const termsA: Array<{ term: string; weight: number }> = [];
      const termsB: Array<{ term: string; weight: number }> = [];

      Object.entries(queryWeights).forEach(([term, qW]) => {
        // Document A (Passage A)
        const arrA = docWeights[term] || [];
        const entryA = arrA.find((e: any) => e["A"] !== undefined);
        if (entryA) {
          const wA = qW * entryA["A"];
          scoreA += wA;
          termsA.push({ term, weight: wA });
        }

        // Document B (Passage B)
        const arrB = docWeights[term] || [];
        const entryB = arrB.find((e: any) => e["B"] !== undefined);
        if (entryB) {
          const wB = qW * entryB["B"];
          scoreB += wB;
          termsB.push({ term, weight: wB });
        }
      });

      termsA.sort((a, b) => b.weight - a.weight);
      termsB.sort((a, b) => b.weight - a.weight);

      let winner = "tie";
      if (scoreA > scoreB) winner = "A";
      else if (scoreB > scoreA) winner = "B";

      const higher = Math.max(scoreA, scoreB);
      const lower = Math.min(scoreA, scoreB);
      const difference = higher - lower;
      const relativeDiff = higher > 0 ? difference / higher : 0;

      return {
        roundIndex: roundIdx,
        query: item.query,
        passageA: item.passageA,
        passageB: item.passageB,
        scoreA: Number(scoreA.toFixed(4)),
        scoreB: Number(scoreB.toFixed(4)),
        winner,
        termsA: termsA.slice(0, 3).map(t => ({ term: t.term, weight: Number(t.weight.toFixed(4)) })),
        termsB: termsB.slice(0, 3).map(t => ({ term: t.term, weight: Number(t.weight.toFixed(4)) })),
        relativeDiffPercent: Math.round(relativeDiff * 100),
      };
    });

    const payload = { rounds: computedRounds };

    // 3. Write cache via upsert to prevent race condition crashes
    await pool.query(
      "INSERT INTO daily_puzzles (puzzle_id, date, payload, day_number) VALUES ($1, $2, $3, $4) ON CONFLICT (puzzle_id, date) DO NOTHING",
      [puzzleId, dateStr, JSON.stringify(payload), dayNumber]
    );

    // Re-select in case another process inserted concurrently
    const selectQuery = await pool.query(
      "SELECT payload FROM daily_puzzles WHERE puzzle_id = $1 AND date = $2",
      [puzzleId, dateStr]
    );

    return c.json({
      puzzle_id: puzzleId,
      date: dateStr,
      day_number: dayNumber,
      payload: selectQuery.rows[0].payload,
    });

  } catch (err: any) {
    console.error("Relevance Arena daily puzzle generation failed:", err);
    return c.json({ error: err.message || "Failed to load Relevance Arena puzzle" }, 500);
  }
});

// Trace Route
puzzleRouter.get("/daily/trace", async (c) => {
  try {
    const reqDate = c.req.query("date");
    const dateStr = reqDate || new Date().toISOString().split("T")[0];

    const puzzleId = "trace";
    const dayNumber = getDayNumber(dateStr);

    // 1. Check database cache
    const cachedQuery = await pool.query(
      "SELECT payload FROM daily_puzzles WHERE puzzle_id = $1 AND date = $2",
      [puzzleId, dateStr]
    );

    if (cachedQuery.rowCount && cachedQuery.rowCount > 0) {
      return c.json({
        puzzle_id: puzzleId,
        date: dateStr,
        day_number: dayNumber,
        payload: cachedQuery.rows[0].payload,
      });
    }

    // 2. Generate on-first-request
    const corpus = getCorpus("trace.json");
    if (corpus.length === 0) {
      return c.json({ error: "Trace corpus is empty or missing" }, 500);
    }

    const pack = await getPack("am");
    const seed = seedFromDate(dateStr + ":trace");

    // Search for a sentence and steps combination that results in an unambiguous solution
    let sentenceIndex = seed % corpus.length;
    let permIndex = seed % ALL_PERMUTATIONS.length;
    let foundPuzzle: any = null;

    // Limit iteration count to prevent infinite loop
    for (let attempts = 0; attempts < 100; attempts++) {
      const sentenceItem = corpus[sentenceIndex];
      const targetSeq = ALL_PERMUTATIONS[permIndex];

      const targetOutputRaw = runSequential(sentenceItem.text, targetSeq, pack);
      const targetOutputStr = formatOutput(targetOutputRaw);

      // Verify that this sequence of the same length is unique in producing the output string
      const sameLengthPerms = ALL_PERMUTATIONS.filter(p => p.length === targetSeq.length);
      let matches = 0;

      for (const perm of sameLengthPerms) {
        const outRaw = runSequential(sentenceItem.text, perm, pack);
        const outStr = formatOutput(outRaw);
        if (outStr === targetOutputStr) {
          matches++;
        }
      }

      // If unique among sequences of the same length, we found it!
      if (matches === 1) {
        foundPuzzle = {
          input: sentenceItem.text,
          targetOutput: targetOutputStr,
          steps: targetSeq,
        };
        break;
      }

      // Stride to the next items
      sentenceIndex = (sentenceIndex + 1) % corpus.length;
      permIndex = (permIndex + 7) % ALL_PERMUTATIONS.length;
    }

    if (!foundPuzzle) {
      // Fallback if no unique sequence found in 100 attempts
      const fallbackItem = corpus[seed % corpus.length];
      const fallbackSeq = ["normalize", "tokenize", "stem"];
      const fallbackOutput = formatOutput(runSequential(fallbackItem.text, fallbackSeq, pack));
      foundPuzzle = {
        input: fallbackItem.text,
        targetOutput: fallbackOutput,
        steps: fallbackSeq,
      };
    }

    // 3. Write cache via upsert to prevent race conditions
    await pool.query(
      "INSERT INTO daily_puzzles (puzzle_id, date, payload, day_number) VALUES ($1, $2, $3, $4) ON CONFLICT (puzzle_id, date) DO NOTHING",
      [puzzleId, dateStr, JSON.stringify(foundPuzzle), dayNumber]
    );

    const selectQuery = await pool.query(
      "SELECT payload FROM daily_puzzles WHERE puzzle_id = $1 AND date = $2",
      [puzzleId, dateStr]
    );

    return c.json({
      puzzle_id: puzzleId,
      date: dateStr,
      day_number: dayNumber,
      payload: selectQuery.rows[0].payload,
    });

  } catch (err: any) {
    console.error("Trace daily puzzle generation failed:", err);
    return c.json({ error: err.message || "Failed to load Trace puzzle" }, 500);
  }
});

export default puzzleRouter;
