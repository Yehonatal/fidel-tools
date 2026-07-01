import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const consoleUrl = process.env.NEXT_PUBLIC_FIDEL_CONSOLE_URL || "http://localhost:3000";
  return NextResponse.redirect(`${consoleUrl}/dashboard/api-keys`);
}
