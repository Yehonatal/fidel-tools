import { NextRequest, NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-auth";
import { felig_transliterate } from "@fidel-tools/core";
import amPack from "@fidel-tools/lang-am";

export async function POST(req: NextRequest) {
  return withApiAuth(req, async () => {
    const { text, direction = "am" } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Body must include { text: string }" }, { status: 400 });
    }

    const result = felig_transliterate(text, direction === "en" ? "en" : "am", amPack);

    return NextResponse.json({
      input: text,
      direction,
      result,
      lang: "am",
    });
  });
}
