import { NextRequest, NextResponse } from "next/server";
import { nlp } from "@/lib/nlp";

type Stage = "normalize" | "lexAnalyze" | "removeStopwords" | "stem" | "transliterate";

export async function POST(req: NextRequest) {
  try {
    const { text, stages }: { text: string; stages: Stage[] } = await req.json();

    if (typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid text input" }, { status: 400 });
    }

    const trace: Record<string, string | string[]> = { input: text };
    let current = text;

    if (stages.includes("normalize")) {
      current = nlp.normalize(current);
      trace.normalize = current;
    }
    if (stages.includes("lexAnalyze")) {
      current = nlp.lexAnalyze(current);
      trace.lexAnalyze = current;
    }
    if (stages.includes("removeStopwords")) {
      current = nlp.removeStopwords(current);
      trace.removeStopwords = current;
    }
    if (stages.includes("stem")) {
      const stems = current
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => nlp.stem(w));
      trace.stem = stems;
      current = stems.join(" ");
    }
    if (stages.includes("transliterate")) {
      trace.transliterate = nlp.feligTransliterate(current, "am");
    }

    return NextResponse.json({ trace, final: current });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
