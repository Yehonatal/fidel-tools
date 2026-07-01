import { NextRequest, NextResponse } from "next/server";
import { nlp } from "@/lib/nlp";

export async function POST(req: NextRequest) {
  try {
    const { text, limit = 8 } = await req.json();
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
      if (s.length > 1) {
        freq[s] = (freq[s] || 0) + 1;
      }
    });

    const tags = Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([stem, count]) => {
        const rawWords = text.split(/\s+/).filter((w) => {
          try {
            return nlp.stem(nlp.normalize(w)) === stem;
          } catch {
            return false;
          }
        });
        return {
          tag: stem,
          count,
          examples: Array.from(new Set(rawWords)).slice(0, 3),
        };
      });

    return NextResponse.json({ tags });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
