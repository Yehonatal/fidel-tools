import { db, apiKeys } from "@fidel-tools/db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { nanoid } from "nanoid";

const PREFIX = "ft_"; // fidel-tools prefix (recognizable in logs)

export function generateApiKey(): {
  raw: string;
  hash: string;
  prefix: string;
} {
  const raw = `${PREFIX}${nanoid(40)}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 10);
  return { raw, hash, prefix };
}

export async function createApiKey(userId: string, name: string, expiresAt?: Date) {
  const { raw, hash, prefix } = generateApiKey();

  await db.insert(apiKeys).values({
    userId,
    name,
    keyHash: hash,
    keyPrefix: prefix,
    expiresAt: expiresAt ?? null,
  });

  // Return raw key ONCE — never stored in plain text
  return { raw, prefix, name };
}

export async function validateApiKey(raw: string): Promise<{
  valid: boolean;
  userId?: string;
  keyId?: string;
}> {
  const hash = crypto.createHash("sha256").update(raw).digest("hex");

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hash), eq(apiKeys.status, "active")))
    .limit(1);

  if (!key) return { valid: false };

  // Check expiry
  if (key.expiresAt && key.expiresAt < new Date()) {
    return { valid: false };
  }

  // Fire-and-forget usage timestamp update
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id))
    .catch(console.error);

  return { valid: true, userId: key.userId, keyId: key.id };
}

export async function revokeApiKey(keyId: string, userId: string) {
  return db
    .update(apiKeys)
    .set({ status: "revoked" as const })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));
}

export async function listApiKeys(userId: string) {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      status: apiKeys.status,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId));
}
