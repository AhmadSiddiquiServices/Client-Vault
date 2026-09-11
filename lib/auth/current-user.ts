import { cookies } from "next/headers";

import { connectToDatabase } from "@/lib/mongodb";

import {
  hashSessionId,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";

import Session from "@/models/Session";
import User from "@/models/User";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  /**
   * ----------------------------------------
   * Verify JWT
   * ----------------------------------------
   *
   * This validates the signature, expiration,
   * userId and sessionId contained in the token.
   */
  const session = await verifySessionToken(sessionToken);

  if (!session) {
    return null;
  }

  await connectToDatabase();

  /**
   * ----------------------------------------
   * Validate database session
   * ----------------------------------------
   *
   * Only the hash of the session ID is stored
   * in MongoDB.
   */
  const sessionIdHash = hashSessionId(session.sessionId);

  const databaseSession = await Session.findOne({
    user: session.userId,
    sessionIdHash,
    revokedAt: null,
  });

  if (!databaseSession) {
    return null;
  }

  /**
   * ----------------------------------------
   * Check database session expiration
   * ----------------------------------------
   *
   * We do not rely on MongoDB TTL cleanup for
   * authentication security.
   */
  if (databaseSession.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  /**
   * ----------------------------------------
   * Update last active timestamp
   * ----------------------------------------
   *
   * This lets the Active Sessions UI show
   * when the session was last used.
   */
  databaseSession.lastActiveAt = new Date();

  await databaseSession.save();

  /**
   * ----------------------------------------
   * Load active user
   * ----------------------------------------
   */
  const user = await User.findOne({
    _id: session.userId,
    isActive: true,
  }).lean();

  if (!user) {
    return null;
  }

  return user;
}
