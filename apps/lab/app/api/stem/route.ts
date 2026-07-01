import { NextRequest, NextResponse } from "next/server";
import { callFidelApi } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  try {
    const { word, words, lang = "am" } = await req.json();

    const data = await callFidelApi("/stem", {
      method: "POST",
      body: { word, words, lang },
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
