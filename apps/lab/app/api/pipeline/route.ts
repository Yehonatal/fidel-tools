import { NextRequest, NextResponse } from "next/server";
import { callFidelApi } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  try {
    const { text, lang = "am", steps } = await req.json();

    if (typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid text input" }, { status: 400 });
    }

    const honoSteps = steps || ["normalize", "tokenize", "stopwords", "stem"];
    
    const data = await callFidelApi("/pipeline", {
      method: "POST",
      body: { text, lang, steps: honoSteps },
    });

    // Remap Hono keys to match expected lab trace structure if needed
    // Hono output keys: input, lang, normalized, sentences, tokens, stopwordsRemoved, stems
    const trace = {
      input: data.input,
      normalize: data.normalized,
      lexAnalyze: data.normalized, // Fallback mapping
      removeStopwords: data.stopwordsRemoved,
      stem: data.stems,
      transliterate: data.stems ? data.stems.join(" ") : "", // Will be overwritten by actual transliteration on frontend or server
    };

    // If transliterate is in steps, perform transliteration query to Hono
    if (honoSteps.includes("transliterate")) {
      try {
        const transData = await callFidelApi("/transliterate", {
          method: "POST",
          body: { text: data.stopwordsRemoved || text, direction: "am", type: "felig", lang },
        });
        trace.transliterate = transData.result;
      } catch (err) {
        console.error("Transliteration sub-query failed:", err);
      }
    }

    return NextResponse.json({ trace, final: trace.transliterate || trace.removeStopwords || text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
