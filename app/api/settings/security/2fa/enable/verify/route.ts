import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { requireUser } from "@/lib/auth/require-user";
import { isOtpExpired, verifyOtp } from "@/lib/auth/otp";
import {
  generateRecoveryCodes,
  hashRecoveryCode,
} from "@/lib/auth/recovery-codes";

import TwoFactorChallenge from "@/models/TwoFactorChallenge";
import Settings from "@/models/Settings";
import RecoveryCode from "@/models/RecoveryCode";

import { DEFAULT_SETTINGS } from "@/lib/settings/default-settings";

export const runtime = "nodejs";

const verifyEnableTwoFactorSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required."),

  code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits."),
});

/**
 * POST /api/settings/security/2fa/enable/verify
 *
 * Verifies the OTP issued specifically for the
 * 2FA enable flow.
 *
 * On successful verification:
 *
 * 1. Consumes the enable challenge
 * 2. Generates recovery codes
 * 3. Stores only recovery-code hashes
 * 4. Enables 2FA
 * 5. Returns plaintext recovery codes once
 *
 * Important:
 * - User must already be authenticated.
 * - Only "enable" challenges are accepted.
 * - No login session is created.
 * - Recovery codes are never stored in plaintext.
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

    const result = verifyEnableTwoFactorSchema.safeParse(body);

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
     * ----------------------------------------
     * Find the enable challenge
     * ----------------------------------------
     *
     * The purpose check prevents login OTPs from
     * being used to enable 2FA.
     */
    const challenge = await TwoFactorChallenge.findOne({
      _id: challengeId,
      user: user._id,
      purpose: "enable",
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
     * ----------------------------------------
     * Prevent challenge reuse
     * ----------------------------------------
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
     * ----------------------------------------
     * Check expiration
     * ----------------------------------------
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
     * ----------------------------------------
     * Check maximum attempts
     * ----------------------------------------
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
     * ----------------------------------------
     * Verify OTP
     * ----------------------------------------
     */
    const codeValid = verifyOtp(code, challenge.codeHash);

    if (!codeValid) {
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
     * ----------------------------------------
     * Generate recovery codes
     * ----------------------------------------
     *
     * Plaintext codes remain only in server memory
     * until returned in the success response.
     */
    const recoveryCodes = generateRecoveryCodes();

    /**
     * Create the database hashes before beginning
     * the transaction so no database document can
     * ever receive plaintext recovery codes.
     */
    const recoveryCodeDocuments = recoveryCodes.map((code) => ({
      user: user._id,
      codeHash: hashRecoveryCode(code),
      usedAt: null,
    }));

    /**
     * ----------------------------------------
     * Complete 2FA setup atomically
     * ----------------------------------------
     */
    const dbSession = await mongoose.startSession();

    try {
      dbSession.startTransaction();

      /**
       * Re-read Settings inside the transaction.
       *
       * This ensures the current database state is
       * used when completing the setup.
       */
      let settings = await Settings.findOne({
        user: user._id,
      }).session(dbSession);

      if (!settings) {
        settings = new Settings({
          user: user._id,
          ...DEFAULT_SETTINGS,
        });

        await settings.save({ session: dbSession });
      }

      /**
       * The flow should only enable 2FA.
       */
      if (settings.security.twoFactorEnabled) {
        await dbSession.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message: "Two-factor authentication is already enabled.",
          },
          { status: 400 },
        );
      }

      /**
       * Consume the challenge.
       */
      challenge.usedAt = new Date();

      await challenge.save({
        session: dbSession,
      });

      /**
       * ----------------------------------------
       * Replace previous recovery-code set
       * ----------------------------------------
       *
       * This protects against stale recovery codes
       * if 2FA was previously enabled, disabled,
       * and then enabled again.
       */
      await RecoveryCode.deleteMany({
        user: user._id,
      }).session(dbSession);

      /**
       * Store only hashed recovery codes.
       */
      await RecoveryCode.insertMany(recoveryCodeDocuments, {
        session: dbSession,
      });

      /**
       * Enable 2FA.
       */
      settings.security.twoFactorEnabled = true;

      await settings.save({
        session: dbSession,
      });

      await dbSession.commitTransaction();

      /**
       * ----------------------------------------
       * Success
       * ----------------------------------------
       *
       * Plaintext recovery codes are returned only
       * in this one successful response.
       */
      return NextResponse.json(
        {
          success: true,
          message: "Two-factor authentication enabled successfully.",
          settings: {
            security: {
              twoFactorEnabled: settings.security.twoFactorEnabled,
            },
          },
          recoveryCodes,
        },
        { status: 200 },
      );
    } catch (transactionError) {
      await dbSession.abortTransaction();

      throw transactionError;
    } finally {
      await dbSession.endSession();
    }
  } catch (error) {
    console.error(
      "POST /api/settings/security/2fa/enable/verify error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while verifying the code.",
      },
      { status: 500 },
    );
  }
}
