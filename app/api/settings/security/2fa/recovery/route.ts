import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { requireUser } from "@/lib/auth/require-user";

import RecoveryCode from "@/models/RecoveryCode";
import Settings from "@/models/Settings";

export const runtime = "nodejs";

/**
 * GET /api/settings/security/2fa/recovery
 *
 * Returns only the number of unused recovery codes.
 *
 * Recovery-code plaintext values and hashes are never
 * returned to the client.
 */
export async function GET() {
  try {
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

    await connectToDatabase();

    const settings = await Settings.findOne({
      user: user._id,
    })
      .select("security.twoFactorEnabled")
      .lean();

    if (!settings?.security?.twoFactorEnabled) {
      return NextResponse.json(
        {
          success: true,
          remainingCodes: 0,
        },
        { status: 200 },
      );
    }

    const remainingCodes = await RecoveryCode.countDocuments({
      user: user._id,
      usedAt: null,
    });

    return NextResponse.json(
      {
        success: true,
        remainingCodes,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/settings/security/2fa/recovery error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load recovery-code status.",
      },
      { status: 500 },
    );
  }
}
