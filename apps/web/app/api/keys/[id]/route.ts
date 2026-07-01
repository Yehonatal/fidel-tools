import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revokeApiKey } from "@/lib/api-keys";
import { sendApiKeyRevokedEmail } from "@/lib/email";
import { db, apiKeys } from "@fidel-tools/db";
import { eq } from "drizzle-orm";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Fetch key name before revocation for the email notification
  const [key] = await db.select({ name: apiKeys.name }).from(apiKeys).where(eq(apiKeys.id, id));

  await revokeApiKey(id, session.user.id);

  // Notify user by email (fire-and-forget)
  if (key) {
    sendApiKeyRevokedEmail(session.user.email, key.name).catch(console.error);
  }

  return NextResponse.json({ success: true });
}
