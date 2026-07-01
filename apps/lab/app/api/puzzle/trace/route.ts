import { NextRequest, NextResponse } from "next/server";
import { callFidelApi } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || "";

    const endpoint = date ? `/puzzle/daily/trace?date=${date}` : `/puzzle/daily/trace`;
    const data = await callFidelApi(endpoint, {
      method: "GET",
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
