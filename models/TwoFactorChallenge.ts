import mongoose, { Document, Model, Schema } from "mongoose";
export type TwoFactorChallengePurpose = "login" | "enable";

export interface ITwoFactorChallenge extends Document {
  user: mongoose.Types.ObjectId;

  purpose: TwoFactorChallengePurpose;

  /**
   * HMAC hash of the OTP.
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
      index: true,
    },

    purpose: {
      type: String,
      enum: ["login", "enable"],
      required: true,
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

TwoFactorChallengeSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    name: "two_factor_challenge_expiration",
  },
);

TwoFactorChallengeSchema.index(
  { user: 1, purpose: 1 },
  {
    unique: true,
    name: "two_factor_challenge_user_purpose_unique",
  },
);

const TwoFactorChallenge: Model<ITwoFactorChallenge> =
  mongoose.models.TwoFactorChallenge ||
  mongoose.model<ITwoFactorChallenge>(
    "TwoFactorChallenge",
    TwoFactorChallengeSchema,
  );

export default TwoFactorChallenge;
