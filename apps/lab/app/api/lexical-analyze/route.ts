import { NextRequest, NextResponse } from "next/server";
import { callFidelApi } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  try {
    const { text, lang = "am" } = await req.json();
    if (typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid text input" }, { status: 400 });
    }

    const data = await callFidelApi("/lexical-analyze", {
      method: "POST",
      body: { text, lang },
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
