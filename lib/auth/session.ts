import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "clientvault_session";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("Please define SESSION_SECRET in your .env.local file");
  }

  return secret;
}

const sessionSecret = getSessionSecret();
const secret = new TextEncoder().encode(sessionSecret);

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload {
  userId: string;
  sessionId: string;
}

/**
 * Generate a cryptographically random session identifier.
 *
 * This identifier is safe to place inside the signed JWT.
 * We store only its hash in MongoDB.
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Hash a session identifier before storing it in the database.
 *
 * HMAC protects the stored identifier from being directly
 * useful if the database contents are exposed.
 */
export function hashSessionId(sessionId: string): string {
  return crypto
    .createHmac("sha256", sessionSecret)
    .update(sessionId, "utf8")
    .digest("hex");
}

/**
 * Create a signed JWT for one specific database session.
 */
export async function createSessionToken(
  userId: string,
  sessionId: string,
): Promise<string> {
  return new SignJWT({
    userId,
    sessionId,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * Verify the JWT signature and extract the session information.
 *
 * This only verifies the JWT itself.
 * Database session validation will happen in getCurrentUser().
 */
export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    if (
      typeof payload.userId !== "string" ||
      typeof payload.sessionId !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      sessionId: payload.sessionId,
    };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME };
