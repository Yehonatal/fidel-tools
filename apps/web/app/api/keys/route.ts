import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createApiKey, listApiKeys } from "@/lib/api-keys";
import { sendApiKeyCreatedEmail } from "@/lib/email";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1).max(80),
  expiresAt: z.string().datetime().optional(),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await listApiKeys(session.user.id);
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, expiresAt } = parsed.data;
  const result = await createApiKey(
    session.user.id,
    name,
    expiresAt ? new Date(expiresAt) : undefined,
  );

  // Notify user by email (fire-and-forget)
  sendApiKeyCreatedEmail(session.user.email, name, result.prefix).catch(console.error);

  // Return raw key only here — can never be retrieved again
  return NextResponse.json({ key: result }, { status: 201 });
}
