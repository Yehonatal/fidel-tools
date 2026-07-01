import { NextRequest, NextResponse } from "next/server";
import { callFidelApi } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  try {
    const { text, lang = "am", steps } = await req.json();

    if (typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid text input" }, { status: 400 });
    }

    const pipelineSteps = steps || ["normalize", "lexAnalyze", "removeStopwords", "stem", "transliterate"];
    
    let current = text;
    const trace: Record<string, string> = {};

    for (const step of pipelineSteps) {
      if (step === "normalize") {
        const data = await callFidelApi("/normalize", {
          method: "POST",
          body: { text: current, lang },
        });
        current = data.normalized;
        trace.normalize = current;
      } else if (step === "lexAnalyze") {
        const data = await callFidelApi("/lexical-analyze", {
          method: "POST",
          body: { text: current, lang },
        });
        current = data.result;
        trace.lexAnalyze = current;
      } else if (step === "removeStopwords") {
        const data = await callFidelApi("/remove-stopwords", {
          method: "POST",
          body: { text: current, lang },
        });
        current = data.result;
        trace.removeStopwords = current;
      } else if (step === "stem") {
        const words = current.split(/\s+/).filter(Boolean);
        const data = await callFidelApi("/stem", {
          method: "POST",
          body: { words, lang },
        });
        current = data.stems ? data.stems.join(" ") : current;
        trace.stem = current;
      } else if (step === "transliterate") {
        const data = await callFidelApi("/transliterate", {
          method: "POST",
          body: { text: current, direction: "am", type: "felig", lang },
        });
        current = data.result;
        trace.transliterate = current;
      }
    }

    return NextResponse.json({ trace, final: current });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
