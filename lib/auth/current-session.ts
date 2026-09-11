import { cookies } from "next/headers";

import { connectToDatabase } from "@/lib/mongodb";

import {
  hashSessionId,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";

import Session from "@/models/Session";

export async function getCurrentSession() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await verifySessionToken(sessionToken);

  if (!session) {
    return null;
  }

  await connectToDatabase();

  const sessionIdHash = hashSessionId(session.sessionId);

  const databaseSession = await Session.findOne({
    user: session.userId,
    sessionIdHash,
    revokedAt: null,
  });

  if (!databaseSession) {
    return null;
  }

  if (databaseSession.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  return databaseSession;
}
