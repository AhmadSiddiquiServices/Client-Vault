import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { requireUser } from "@/lib/auth/require-user";
import { verifyPassword } from "@/lib/auth/password";

import Settings from "@/models/Settings";
import { DEFAULT_SETTINGS } from "@/lib/settings/default-settings";

export const runtime = "nodejs";

const disableTwoFactorSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
});

/**
 * POST /api/settings/security/2fa/disable
 *
 * Securely disables 2FA after verifying the user's
 * current account password.
 *
 * Important:
 * - User must already be authenticated.
 * - Current password must be correct.
 * - No session is created or changed.
 * - 2FA is only disabled after successful re-authentication.
 */
export async function POST(request: Request) {
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
     * Validate request
     * ----------------------------------------
     */
    const body = await request.json();

    const result = disableTwoFactorSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { currentPassword } = result.data;

    await connectToDatabase();

    /**
     * ----------------------------------------
     * Load password hash
     * ----------------------------------------
     *
     * passwordHash uses select:false in User.ts,
     * so explicitly request it.
     */
    const authenticatedUser = await (
      await import("@/models/User")
    ).default
      .findOne({
        _id: user._id,
        isActive: true,
      })
      .select("+passwordHash");

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "This account is no longer available.",
        },
        { status: 403 },
      );
    }

    /**
     * ----------------------------------------
     * Verify current password
     * ----------------------------------------
     */
    const passwordValid = await verifyPassword(
      currentPassword,
      authenticatedUser.passwordHash,
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect.",
        },
        { status: 401 },
      );
    }

    /**
     * ----------------------------------------
     * Load Settings
     * ----------------------------------------
     */
    let settings = await Settings.findOne({
      user: authenticatedUser._id,
    });

    if (!settings) {
      settings = await Settings.create({
        user: authenticatedUser._id,
        ...DEFAULT_SETTINGS,
      });
    }

    /**
     * ----------------------------------------
     * Check current state
     * ----------------------------------------
     */
    if (!settings.security.twoFactorEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: "Two-factor authentication is already disabled.",
        },
        { status: 400 },
      );
    }

    /**
     * ----------------------------------------
     * Disable 2FA
     * ----------------------------------------
     */
    settings.security.twoFactorEnabled = false;

    await settings.save();

    return NextResponse.json(
      {
        success: true,
        message: "Two-factor authentication disabled successfully.",
        settings: {
          security: {
            twoFactorEnabled: settings.security.twoFactorEnabled,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/settings/security/2fa/disable error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while disabling two-factor authentication.",
      },
      { status: 500 },
    );
  }
}
