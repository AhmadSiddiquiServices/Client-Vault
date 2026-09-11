import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { requireUser } from "@/lib/auth/require-user";
import { getCurrentSession } from "@/lib/auth/current-session";

import Session from "@/models/Session";

export const runtime = "nodejs";

/**
 * POST /api/settings/security/sessions/revoke-others
 *
 * Revokes every active session belonging to the authenticated
 * user except the current session.
 *
 * The current browser remains logged in.
 */
export async function POST() {
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
     * Identify current session
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

    /**
     * ----------------------------------------
     * Revoke all other active sessions
     * ----------------------------------------
     *
     * Important:
     * The current session ID is explicitly excluded.
     */
    const result = await Session.updateMany(
      {
        user: user._id,
        _id: { $ne: currentSession._id },
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );

    return NextResponse.json(
      {
        success: true,
        message:
          result.modifiedCount > 0
            ? "All other sessions have been revoked."
            : "There were no other active sessions to revoke.",
        revokedCount: result.modifiedCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "POST /api/settings/security/sessions/revoke-others error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to revoke other sessions.",
      },
      { status: 500 },
    );
  }
}
