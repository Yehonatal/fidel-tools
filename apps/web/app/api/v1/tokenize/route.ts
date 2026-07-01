import { NextRequest, NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-auth";
import { sentenceTokenize } from "@fidel-tools/core";
import amPack from "@fidel-tools/lang-am";

export async function POST(req: NextRequest) {
  return withApiAuth(req, async () => {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Body must include { text: string }" }, { status: 400 });
    }

    const sentences = sentenceTokenize(text, amPack);
    const words = text.split(/\s+/).filter(Boolean);

    return NextResponse.json({ input: text, sentences, words, lang: "am" });
  });
}
