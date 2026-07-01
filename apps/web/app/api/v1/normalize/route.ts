import { NextRequest, NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-auth";
import {
  normalize,
  sentenceTokenize,
  stem,
  removeStopwords,
  felig_transliterate,
} from "@fidel-tools/core";
import amPack from "@fidel-tools/lang-am";

export async function POST(req: NextRequest) {
  return withApiAuth(req, async () => {
    const body = await req.json();
    const { text, steps } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Body must include { text: string }" }, { status: 400 });
    }

    const pipelineSteps = steps || ["normalize", "tokenize", "stopwords", "stem"];
    const result: Record<string, unknown> = { input: text, lang: "am" };
    let current = text;

    if (pipelineSteps.includes("normalize")) {
      current = normalize(current, amPack);
      result.normalized = current;
    }
    if (pipelineSteps.includes("tokenize")) {
      result.sentences = sentenceTokenize(current, amPack);
      result.tokens = current.split(/\s+/).filter(Boolean);
    }
    if (pipelineSteps.includes("stopwords")) {
      current = removeStopwords(current, amPack);
      result.stopwordsRemoved = current;
    }
    if (pipelineSteps.includes("stem")) {
      const tokenList = current.split(/\s+/).filter(Boolean);
      result.stems = tokenList.map((w: string) => stem(w, amPack));
    }

    return NextResponse.json({ result });
  });
}
