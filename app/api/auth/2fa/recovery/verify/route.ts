import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";
import { verifyRecoveryCode } from "@/lib/auth/recovery-codes";
import {
  getRequestIpAddress,
  getRequestUserAgent,
} from "@/lib/auth/request-info";

import RecoveryCode from "@/models/RecoveryCode";
import TwoFactorChallenge from "@/models/TwoFactorChallenge";
import User from "@/models/User";

import { isOtpExpired } from "@/lib/auth/otp";
import { createDatabaseSession } from "@/lib/auth/create-session";

export const runtime = "nodejs";

const recoveryLoginSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required."),
  recoveryCode: z.string().min(1, "Recovery code is required."),
});

/**
 * POST /api/auth/2fa/recovery/verify
 *
 * Completes a 2FA login using a recovery code instead
 * of the emailed OTP.
 *
 * Important:
 * - No existing authenticated session is required.
 * - Challenge must belong to the login flow.
 * - Recovery code must belong to the same user.
 * - Recovery code can only be used once.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = recoveryLoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid recovery request.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { challengeId, recoveryCode } = result.data;

    await connectToDatabase();

    /**
     * ----------------------------------------
     * Validate login challenge
     * ----------------------------------------
     */
    const challenge = await TwoFactorChallenge.findOne({
      _id: challengeId,
      purpose: "login",
    });

    if (!challenge) {
      return NextResponse.json(
        {
          success: false,
          message: "This verification request is invalid or has expired.",
        },
        { status: 400 },
      );
    }

    if (challenge.usedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "This verification request has already been used.",
        },
        { status: 400 },
      );
    }

    if (isOtpExpired(challenge.expiresAt)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This verification request has expired. Please sign in again.",
        },
        { status: 400 },
      );
    }

    /**
     * Use the same attempt budget as the OTP flow.
     */
    if (challenge.attempts >= challenge.maxAttempts) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many incorrect attempts. Please start the login process again.",
        },
        { status: 429 },
      );
    }

    /**
     * ----------------------------------------
     * Find active recovery codes
     * ----------------------------------------
     *
     * Only hashes are stored in MongoDB.
     */
    const recoveryCodes = await RecoveryCode.find({
      user: challenge.user,
      usedAt: null,
    }).select("+codeHash");

    /**
     * ----------------------------------------
     * Find matching recovery code
     * ----------------------------------------
     *
     * There are only 10 codes, so checking each
     * candidate hash server-side is acceptable.
     */
    let matchedRecoveryCode: (typeof recoveryCodes)[number] | null = null;

    for (const storedCode of recoveryCodes) {
      if (verifyRecoveryCode(recoveryCode, storedCode.codeHash)) {
        matchedRecoveryCode = storedCode;
        break;
      }
    }

    if (!matchedRecoveryCode) {
      challenge.attempts += 1;

      await challenge.save();

      const attemptsRemaining = Math.max(
        challenge.maxAttempts - challenge.attempts,
        0,
      );

      if (attemptsRemaining === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Too many incorrect attempts. Please start the login process again.",
          },
          { status: 429 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Invalid recovery code.",
          attemptsRemaining,
        },
        { status: 400 },
      );
    }

    /**
     * ----------------------------------------
     * Consume recovery code atomically
     * ----------------------------------------
     *
     * The usedAt:null condition prevents the same
     * recovery code from being consumed twice by
     * concurrent requests.
     */
    const consumedRecoveryCode = await RecoveryCode.findOneAndUpdate(
      {
        _id: matchedRecoveryCode._id,
        user: challenge.user,
        usedAt: null,
      },
      {
        $set: {
          usedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );

    if (!consumedRecoveryCode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This recovery code has already been used. Please use another code.",
        },
        { status: 409 },
      );
    }

    /**
     * ----------------------------------------
     * Find active user
     * ----------------------------------------
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
     * ----------------------------------------
     * Consume login challenge
     * ----------------------------------------
     */
    challenge.usedAt = new Date();

    await challenge.save();

    /**
     * ----------------------------------------
     * Complete login
     * ----------------------------------------
     */
    user.lastLoginAt = new Date();

    await user.save();

    const databaseSession = await createDatabaseSession({
      userId: user._id.toString(),
      userAgent: getRequestUserAgent(request),
      ipAddress: getRequestIpAddress(request),
    });

    const sessionToken = await createSessionToken(
      user._id.toString(),
      databaseSession.sessionId,
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "Recovery code verified successfully.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 },
    );

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
    console.error("POST /api/auth/2fa/recovery/verify error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while verifying the recovery code.",
      },
      { status: 500 },
    );
  }
}
