import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { requireUser } from "@/lib/auth/require-user";
import { getCurrentSession } from "@/lib/auth/current-session";

import Session from "@/models/Session";

export const runtime = "nodejs";

/**
 * GET /api/settings/security/sessions
 *
 * Returns the authenticated user's active sessions.
 *
 * Sensitive authentication values are never returned.
 */
export async function GET() {
  try {
    /**
     * ----------------------------------------
     * Authenticate current user
     * ----------------------------------------
     */
    const user = await requireUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 },
      );
    }

    /**
     * ----------------------------------------
     * Identify current database session
     * ----------------------------------------
     */
    const currentSession = await getCurrentSession();

    if (!currentSession) {
      return NextResponse.json(
        {
          success: false,
          message: "Current session is no longer valid.",
        },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const now = new Date();

    /**
     * ----------------------------------------
     * Find all active sessions
     * ----------------------------------------
     *
     * Only sessions belonging to the authenticated
     * user are returned.
     *
     * Revoked and expired sessions are excluded.
     */
    const sessions = await Session.find({
      user: user._id,
      revokedAt: null,
      expiresAt: { $gt: now },
    })
      .sort({
        lastActiveAt: -1,
      })
      .lean();

    /**
     * ----------------------------------------
     * Return safe session information
     * ----------------------------------------
     *
     * Do NOT expose:
     * - sessionIdHash
     * - JWT
     * - authentication cookies
     */
    const safeSessions = sessions.map((session) => ({
      id: session._id.toString(),
      userAgent: session.userAgent ?? null,
      ipAddress: session.ipAddress ?? null,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      expiresAt: session.expiresAt,
      isCurrent: session._id.toString() === currentSession._id.toString(),
    }));

    return NextResponse.json(
      {
        success: true,
        sessions: safeSessions,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/settings/security/sessions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load active sessions.",
      },
      { status: 500 },
    );
  }
}
