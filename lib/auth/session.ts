import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "clientvault_session";
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("Please define SESSION_SECRET in your .env.local file");
}

const secret = new TextEncoder().encode(SESSION_SECRET);

export interface SessionPayload {
  userId: string;
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({
    userId,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    if (typeof payload.userId !== "string") {
      return null;
    }

    return {
      userId: payload.userId,
    };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME };
