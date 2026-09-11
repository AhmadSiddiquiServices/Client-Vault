import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISession extends Document {
  user: mongoose.Types.ObjectId;

  /**
   * Hash of the session identifier stored inside the JWT.
   *
   * We never store the actual session identifier in the database.
   */
  sessionIdHash: string;

  /**
   * Device/browser information.
   */
  userAgent?: string | null;

  /**
   * Client IP address when the session was created.
   */
  ipAddress?: string | null;

  /**
   * Session creation timestamp.
   */
  createdAt: Date;

  /**
   * Most recent authenticated activity.
   */
  lastActiveAt: Date;

  /**
   * Session expiration timestamp.
   */
  expiresAt: Date;

  /**
   * When the session was explicitly revoked.
   */
  revokedAt?: Date | null;

  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sessionIdHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userAgent: {
      type: String,
      default: null,
      maxlength: 1000,
    },

    ipAddress: {
      type: String,
      default: null,
      maxlength: 100,
    },

    lastActiveAt: {
      type: Date,
      required: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    revokedAt: {
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
 * Automatically clean up expired sessions.
 *
 * Session validation will still explicitly check expiresAt.
 */
SessionSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    name: "session_expiration",
  },
);

const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);

export default Session;
