import { hashSessionId, generateSessionId } from "@/lib/auth/session";
import Session from "@/models/Session";

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type CreateSessionOptions = {
  userId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
};

export async function createDatabaseSession({
  userId,
  userAgent,
  ipAddress,
}: CreateSessionOptions) {
  const sessionId = generateSessionId();

  const now = new Date();

  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_MS);

  await Session.create({
    user: userId,
    sessionIdHash: hashSessionId(sessionId),
    userAgent: userAgent || null,
    ipAddress: ipAddress || null,
    createdAt: now,
    lastActiveAt: now,
    expiresAt,
    revokedAt: null,
  });

  return {
    sessionId,
    expiresAt,
  };
}
