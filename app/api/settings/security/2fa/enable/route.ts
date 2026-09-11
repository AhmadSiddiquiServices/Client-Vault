import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { requireUser } from "@/lib/auth/require-user";
import { createTwoFactorChallenge } from "@/lib/auth/two-factor";
import { sendTwoFactorOtp } from "@/lib/email/send-two-factor-otp";

import TwoFactorChallenge from "@/models/TwoFactorChallenge";
import Settings from "@/models/Settings";
import { DEFAULT_SETTINGS } from "@/lib/settings/default-settings";

export const runtime = "nodejs";

/**
 * POST /api/settings/security/2fa/enable
 *
 * Starts the secure 2FA enable flow.
 *
 * Important:
 * - User must already be authenticated.
 * - 2FA must currently be disabled.
 * - No session is created here.
 * - Settings.twoFactorEnabled is NOT changed here.
 *
 * The user must successfully verify the emailed OTP first.
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

    await connectToDatabase();

    /**
     * ----------------------------------------
     * Load settings
     * ----------------------------------------
     *
     * Existing users may not have a Settings
     * document yet, so create the defaults when
     * necessary.
     */
    let settings = await Settings.findOne({
      user: user._id,
    });

    if (!settings) {
      settings = await Settings.create({
        user: user._id,
        ...DEFAULT_SETTINGS,
      });
    }

    /**
     * ----------------------------------------
     * Make sure 2FA is not already enabled
     * ----------------------------------------
     */
    if (settings.security.twoFactorEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: "Two-factor authentication is already enabled.",
        },
        { status: 400 },
      );
    }

    /**
     * ----------------------------------------
     * Create a dedicated ENABLE challenge
     * ----------------------------------------
     *
     * This is deliberately different from the
     * LOGIN challenge.
     */
    const challenge = await createTwoFactorChallenge(user._id, "enable");

    /**
     * ----------------------------------------
     * Send OTP to user's email
     * ----------------------------------------
     */
    try {
      await sendTwoFactorOtp({
        email: user.email,
        userName: user.name,
        otp: challenge.otp,
        expiresInMinutes: 10,
      });
    } catch (emailError) {
      /**
       * Do not leave a challenge behind when the
       * verification email was never delivered.
       */
      await TwoFactorChallenge.deleteOne({
        _id: challenge.challengeId,
        user: user._id,
        purpose: "enable",
      });

      console.error("Failed to send 2FA enable OTP email:", emailError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to send the verification code. Please try again.",
        },
        { status: 500 },
      );
    }

    /**
     * ----------------------------------------
     * Return challenge information
     * ----------------------------------------
     *
     * No sensitive data such as the OTP itself
     * is returned to the browser.
     */
    return NextResponse.json(
      {
        success: true,
        message: "A verification code has been sent to your email.",
        challengeId: challenge.challengeId,
        expiresAt: challenge.expiresAt,
        resendAvailableAt: challenge.resendAvailableAt,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/settings/security/2fa/enable error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while starting two-factor authentication.",
      },
      { status: 500 },
    );
  }
}
