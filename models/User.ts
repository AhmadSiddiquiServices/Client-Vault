import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: Date | null;

  passwordResetTokenHash?: string | null;
  passwordResetExpiresAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    avatarUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * A user email must be unique.
 */
UserSchema.index(
  { email: 1 },
  {
    unique: true,
    name: "user_email_unique",
  },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
