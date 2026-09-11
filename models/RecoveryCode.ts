import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRecoveryCode extends Document {
  user: mongoose.Types.ObjectId;

  /**
   * HMAC hash of the recovery code.
   *
   * The plaintext recovery code is never stored.
   */
  codeHash: string;

  /**
   * When this recovery code was used.
   *
   * null means the code is still available.
   */
  usedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const RecoveryCodeSchema = new Schema<IRecoveryCode>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    codeHash: {
      type: String,
      required: true,
      select: false,
    },

    usedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * A user cannot have duplicate recovery-code hashes.
 */
RecoveryCodeSchema.index(
  { user: 1, codeHash: 1 },
  {
    unique: true,
    name: "recovery_code_user_hash_unique",
  },
);

const RecoveryCode: Model<IRecoveryCode> =
  mongoose.models.RecoveryCode ||
  mongoose.model<IRecoveryCode>("RecoveryCode", RecoveryCodeSchema);

export default RecoveryCode;
