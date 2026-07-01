import { NextRequest, NextResponse } from "next/server";
import { callFidelApi } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const data = await callFidelApi("/languages", { method: "GET" });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
