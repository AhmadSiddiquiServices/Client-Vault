import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITwoFactorChallenge extends Document {
  user: mongoose.Types.ObjectId;

  /**
   * HMAC hash of the OTP.
   *
   * Never store the plaintext OTP.
   */
  codeHash: string;

  /**
   * OTP expiration timestamp.
   */
  expiresAt: Date;

  /**
   * Number of failed verification attempts.
   */
  attempts: number;

  /**
   * Maximum allowed verification attempts.
   */
  maxAttempts: number;

  /**
   * Timestamp of the most recent OTP send/resend.
   *
   * Used for resend cooldown enforcement.
   */
  lastSentAt: Date;

  /**
   * When the challenge was successfully consumed.
   */
  usedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const TwoFactorChallengeSchema = new Schema<ITwoFactorChallenge>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    codeHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    attempts: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    maxAttempts: {
      type: Number,
      required: true,
      default: 5,
      min: 1,
    },

    lastSentAt: {
      type: Date,
      required: true,
    },

    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Automatically remove expired challenges.
 *
 * MongoDB TTL cleanup is not our security mechanism.
 * Verification code will still explicitly check expiresAt.
 */
TwoFactorChallengeSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    name: "two_factor_challenge_expiration",
  },
);

const TwoFactorChallenge: Model<ITwoFactorChallenge> =
  mongoose.models.TwoFactorChallenge ||
  mongoose.model<ITwoFactorChallenge>(
    "TwoFactorChallenge",
    TwoFactorChallengeSchema,
  );

export default TwoFactorChallenge;
