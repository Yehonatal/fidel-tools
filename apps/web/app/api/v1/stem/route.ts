import { NextRequest, NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-auth";
import { stem } from "@fidel-tools/core";
import amPack from "@fidel-tools/lang-am";

export async function POST(req: NextRequest) {
  return withApiAuth(req, async () => {
    const { word, words } = await req.json();

    if (word && typeof word === "string") {
      const stemmed = stem(word, amPack);
      return NextResponse.json({ input: word, stem: stemmed, lang: "am" });
    }

    if (Array.isArray(words)) {
      const stems = words.map((w: string) => ({
        word: w,
        stem: typeof w === "string" ? stem(w, amPack) : null,
      }));
      return NextResponse.json({ stems, lang: "am" });
    }

    return NextResponse.json(
      { error: "Missing 'word' string or 'words' array in request body" },
      { status: 400 },
    );
  });
}
