import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { requireUser } from "@/lib/auth/require-user";
import { verifyPassword } from "@/lib/auth/password";
import {
  generateRecoveryCodes,
  hashRecoveryCode,
} from "@/lib/auth/recovery-codes";

import RecoveryCode from "@/models/RecoveryCode";
import Settings from "@/models/Settings";
import User from "@/models/User";

import { DEFAULT_SETTINGS } from "@/lib/settings/default-settings";

export const runtime = "nodejs";

const regenerateRecoveryCodesSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
});

/**
 * POST /api/settings/security/2fa/recovery/regenerate
 *
 * Regenerates the complete recovery-code set.
 *
 * Important:
 * - User must already be authenticated.
 * - Current password must be correct.
 * - 2FA must currently be enabled.
 * - Previous recovery codes are invalidated.
 * - New plaintext recovery codes are returned only once.
 * - Only hashed recovery codes are stored in MongoDB.
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

    const result = regenerateRecoveryCodesSchema.safeParse(body);

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
     * Load user password hash
     * ----------------------------------------
     */
    const authenticatedUser = await User.findOne({
      _id: user._id,
      isActive: true,
    }).select("+passwordHash");

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
     * Re-authenticate user
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
     * Check 2FA state
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

    if (!settings.security.twoFactorEnabled) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Two-factor authentication must be enabled to use recovery codes.",
        },
        { status: 400 },
      );
    }

    /**
     * ----------------------------------------
     * Generate new recovery codes
     * ----------------------------------------
     */
    const recoveryCodes = generateRecoveryCodes();

    const recoveryCodeDocuments = recoveryCodes.map((code) => ({
      user: authenticatedUser._id,
      codeHash: hashRecoveryCode(code),
      usedAt: null,
    }));

    /**
     * ----------------------------------------
     * Replace recovery-code set atomically
     * ----------------------------------------
     */
    const dbSession = await mongoose.startSession();

    try {
      dbSession.startTransaction();

      /**
       * Remove all previous recovery codes.
       *
       * This immediately invalidates every old code.
       */
      await RecoveryCode.deleteMany({
        user: authenticatedUser._id,
      }).session(dbSession);

      /**
       * Store only hashes of the new codes.
       */
      await RecoveryCode.insertMany(recoveryCodeDocuments, {
        session: dbSession,
      });

      await dbSession.commitTransaction();

      /**
       * ----------------------------------------
       * Return plaintext codes once
       * ----------------------------------------
       */
      return NextResponse.json(
        {
          success: true,
          message: "Recovery codes regenerated successfully.",
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
      "POST /api/settings/security/2fa/recovery/regenerate error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to regenerate recovery codes.",
      },
      { status: 500 },
    );
  }
}
