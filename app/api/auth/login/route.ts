import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { createTwoFactorChallenge } from "@/lib/auth/two-factor";
import { sendTwoFactorOtp } from "@/lib/email/send-two-factor-otp";

import TwoFactorChallenge from "@/models/TwoFactorChallenge";
import Settings from "@/models/Settings";
import User from "@/models/User";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login details.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    await connectToDatabase();

    /**
     * passwordHash has select:false in User.ts,
     * so explicitly request it here.
     */
    const user = await User.findOne({
      email,
    }).select("+passwordHash");

    /**
     * Use the same generic response for a missing user
     * and an incorrect password.
     *
     * This avoids revealing whether an email exists.
     */
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "This account is inactive.",
        },
        { status: 403 },
      );
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    /**
     * ----------------------------------------
     * Check 2FA preference
     * ----------------------------------------
     *
     * Settings belongs to the authenticated user.
     *
     * If the settings document does not exist yet,
     * two-factor authentication is treated as disabled.
     */
    const settings = await Settings.findOne({
      user: user._id,
    })
      .select("security.twoFactorEnabled")
      .lean();

    const twoFactorEnabled = settings?.security?.twoFactorEnabled === true;

    /**
     * ----------------------------------------
     * 2FA enabled
     * ----------------------------------------
     *
     * Do NOT:
     * - update lastLoginAt
     * - create a session
     * - set clientvault_session
     *
     * The user must complete OTP verification first.
     */
    if (twoFactorEnabled) {
      const challenge = await createTwoFactorChallenge(user._id);

      try {
        await sendTwoFactorOtp({
          email: user.email,
          userName: user.name,
          otp: challenge.otp,
          expiresInMinutes: 10,
        });
      } catch (emailError) {
        /**
         * If the email could not be sent, remove the
         * challenge so the user doesn't get stuck with
         * an OTP that was never delivered.
         */

        await TwoFactorChallenge.deleteOne({
          _id: challenge.challengeId,
          user: user._id,
        });

        console.error("Failed to send 2FA OTP email:", emailError);

        return NextResponse.json(
          {
            success: false,
            message: "Unable to send the verification code. Please try again.",
          },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          requiresTwoFactor: true,
          challengeId: challenge.challengeId,
          message: "A verification code has been sent to your email.",
          user: {
            name: user.name,
            email: user.email,
          },
        },
        { status: 200 },
      );
    }

    /**
     * ----------------------------------------
     * 2FA disabled
     * ----------------------------------------
     *
     * Existing login behavior remains unchanged.
     */
    user.lastLoginAt = new Date();

    await user.save();

    /**
     * Create signed session token.
     */
    const sessionToken = await createSessionToken(user._id.toString());

    const response = NextResponse.json(
      {
        success: true,
        requiresTwoFactor: false,
        message: "Login successful.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 },
    );

    /**
     * Store the session in an HTTP-only cookie.
     */
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
