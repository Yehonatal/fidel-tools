import { NextRequest, NextResponse } from "next/server";
import { nlp } from "@/lib/nlp";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid text input" }, { status: 400 });
    }

    const normalized = nlp.normalize(text);
    const lexed = nlp.lexAnalyze(normalized);
    const cleaned = nlp.removeStopwords(lexed);
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    const stems = tokens.map((w) => nlp.stem(w));

    const freq: Record<string, number> = {};
    stems.forEach((s) => {
      freq[s] = (freq[s] || 0) + 1;
    });
    const topKeywords = Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20);

    const transliterated = nlp.feligTransliterate(cleaned, "am");

    const rawWordsCount = text.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      wordCount: {
        raw: rawWordsCount,
        afterProcessing: tokens.length,
      },
      topKeywords,
      transliterated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
