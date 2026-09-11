import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";

import { createDatabaseSession } from "@/lib/auth/create-session";

import {
  getRequestIpAddress,
  getRequestUserAgent,
} from "@/lib/auth/request-info";
import { isOtpExpired, verifyOtp } from "@/lib/auth/otp";

import TwoFactorChallenge from "@/models/TwoFactorChallenge";
import User from "@/models/User";

export const runtime = "nodejs";

const verifyTwoFactorSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required."),

  code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = verifyTwoFactorSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification request.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { challengeId, code } = result.data;

    await connectToDatabase();

    /**
     * Find the active challenge.
     *
     * codeHash has select:false, so explicitly request it.
     */
    const challenge = await TwoFactorChallenge.findOne({
      _id: challengeId,
      purpose: "login",
    }).select("+codeHash");

    if (!challenge) {
      return NextResponse.json(
        {
          success: false,
          message: "This verification request is invalid or has expired.",
        },
        { status: 400 },
      );
    }

    /**
     * A challenge can only be consumed once.
     */
    if (challenge.usedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "This verification code has already been used.",
        },
        { status: 400 },
      );
    }

    /**
     * Explicit expiration check.
     *
     * We do not rely on MongoDB TTL cleanup for security.
     */
    if (isOtpExpired(challenge.expiresAt)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This verification code has expired. Please request a new code.",
        },
        { status: 400 },
      );
    }

    /**
     * Enforce the maximum number of verification attempts.
     */
    if (challenge.attempts >= challenge.maxAttempts) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many incorrect attempts. Please request a new verification code.",
        },
        { status: 429 },
      );
    }

    /**
     * Verify the submitted OTP against the stored HMAC hash.
     */
    const codeValid = verifyOtp(code, challenge.codeHash);

    if (!codeValid) {
      challenge.attempts += 1;

      await challenge.save();

      const attemptsRemaining = Math.max(
        challenge.maxAttempts - challenge.attempts,
        0,
      );

      /**
       * Don't expose more information than necessary,
       * but giving the remaining attempts is useful here
       * because the code itself has already been invalid.
       */
      if (attemptsRemaining === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Too many incorrect attempts. Please request a new verification code.",
          },
          { status: 429 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification code.",
          attemptsRemaining,
        },
        { status: 400 },
      );
    }

    /**
     * Find the associated active user.
     */
    const user = await User.findOne({
      _id: challenge.user,
      isActive: true,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "This account is no longer available.",
        },
        { status: 403 },
      );
    }

    /**
     * Consume the challenge before creating the session.
     *
     * This ensures the OTP cannot be reused.
     */
    challenge.usedAt = new Date();

    await challenge.save();

    /**
     * This is now a completed login.
     */
    user.lastLoginAt = new Date();

    await user.save();

    /**
     * Create the normal ClientVault session.
     */
    const session = await createDatabaseSession({
      userId: user._id.toString(),
      userAgent: getRequestUserAgent(request),
      ipAddress: getRequestIpAddress(request),
    });

    const sessionToken = await createSessionToken(
      user._id.toString(),
      session.sessionId,
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "Two-factor verification successful.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 },
    );

    /**
     * Set the normal authenticated session cookie.
     *
     * This is intentionally done ONLY after successful OTP
     * verification.
     */
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("2FA verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while verifying the code. Please try again.",
      },
      { status: 500 },
    );
  }
}
