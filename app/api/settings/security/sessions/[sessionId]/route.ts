import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { requireUser } from "@/lib/auth/require-user";
import { getCurrentSession } from "@/lib/auth/current-session";

import Session from "@/models/Session";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

/**
 * DELETE /api/settings/security/sessions/:sessionId
 *
 * Revokes one session belonging to the authenticated user.
 *
 * The current session cannot be revoked through this endpoint.
 * That should be handled separately by logout / revoke-all-other-sessions.
 */
export async function DELETE(request: Request, context: RouteContext) {
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
     * Get current session
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

    /**
     * ----------------------------------------
     * Get requested session ID
     * ----------------------------------------
     */
    const { sessionId } = await context.params;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Session ID is required.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    /**
     * ----------------------------------------
     * Prevent revoking current session
     * ----------------------------------------
     */
    if (currentSession._id.toString() === sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Your current session cannot be revoked here.",
        },
        { status: 400 },
      );
    }

    /**
     * ----------------------------------------
     * Revoke requested session
     * ----------------------------------------
     *
     * The user filter is important.
     *
     * A user must never be able to revoke another
     * user's session simply by knowing its ID.
     */
    const session = await Session.findOneAndUpdate(
      {
        _id: sessionId,
        user: user._id,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
      {
        new: true,
      },
    ).lean();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Session not found or has already been revoked.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Session revoked successfully.",
        session: {
          id: session._id.toString(),
          revokedAt: session.revokedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "DELETE /api/settings/security/sessions/[sessionId] error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to revoke session.",
      },
      { status: 500 },
    );
  }
}
