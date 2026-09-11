import mongoose from "mongoose";

import TwoFactorChallenge, {
  TwoFactorChallengePurpose,
} from "@/models/TwoFactorChallenge";

import {
  generateOtp,
  hashOtp,
  isOtpResendAllowed,
  OTP_EXPIRATION_MS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
} from "@/lib/auth/otp";

export type TwoFactorChallengeResult = {
  challengeId: string;
  otp: string;
  expiresAt: Date;
  resendAvailableAt: Date;
};

export type TwoFactorResendResult =
  | {
      success: true;
      challengeId: string;
      otp: string;
      expiresAt: Date;
      resendAvailableAt: Date;
    }
  | {
      success: false;
      retryAfterSeconds: number;
    };

export async function createTwoFactorChallenge(
  userId: mongoose.Types.ObjectId,
  purpose: TwoFactorChallengePurpose,
): Promise<TwoFactorChallengeResult> {
  const otp = generateOtp();
  const codeHash = hashOtp(otp);

  const now = new Date();

  const expiresAt = new Date(now.getTime() + OTP_EXPIRATION_MS);

  const resendAvailableAt = new Date(now.getTime() + OTP_RESEND_COOLDOWN_MS);

  const challenge = await TwoFactorChallenge.findOneAndUpdate(
    {
      user: userId,
      purpose,
    },
    {
      $set: {
        purpose,
        codeHash,
        expiresAt,
        attempts: 0,
        maxAttempts: OTP_MAX_ATTEMPTS,
        lastSentAt: now,
        usedAt: null,
      },

      $setOnInsert: {
        user: userId,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return {
    challengeId: challenge._id.toString(),
    otp,
    expiresAt,
    resendAvailableAt,
  };
}

export async function resendTwoFactorChallenge(
  userId: mongoose.Types.ObjectId,
  purpose: TwoFactorChallengePurpose,
): Promise<TwoFactorResendResult> {
  const challenge = await TwoFactorChallenge.findOne({
    user: userId,
    purpose,
  }).select("+codeHash");

  if (!challenge) {
    return {
      success: false,
      retryAfterSeconds: 0,
    };
  }

  if (!isOtpResendAllowed(challenge.lastSentAt)) {
    const remainingMs =
      OTP_RESEND_COOLDOWN_MS - (Date.now() - challenge.lastSentAt.getTime());

    return {
      success: false,
      retryAfterSeconds: Math.ceil(Math.max(remainingMs, 0) / 1000),
    };
  }

  const otp = generateOtp();
  const codeHash = hashOtp(otp);

  const now = new Date();

  const expiresAt = new Date(now.getTime() + OTP_EXPIRATION_MS);

  const resendAvailableAt = new Date(now.getTime() + OTP_RESEND_COOLDOWN_MS);

  challenge.codeHash = codeHash;
  challenge.expiresAt = expiresAt;
  challenge.attempts = 0;
  challenge.maxAttempts = OTP_MAX_ATTEMPTS;
  challenge.lastSentAt = now;
  challenge.usedAt = null;

  await challenge.save();

  return {
    success: true,
    challengeId: challenge._id.toString(),
    otp,
    expiresAt,
    resendAvailableAt,
  };
}
