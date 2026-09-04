import mongoose, { Document, Model, Schema } from "mongoose";

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "viewed"
  | "copied"
  | "archived"
  | "restored";

export type ActivityEntity =
  | "client"
  | "project"
  | "credential"
  | "category"
  | "tag";

export interface IActivity extends Document {
  owner: mongoose.Types.ObjectId;

  action: ActivityAction;
  entity: ActivityEntity;
  entityId: mongoose.Types.ObjectId;

  /**
   * Human-readable description of the activity.
   *
   * Example:
   * "Viewed GitHub - Main Account credential"
   */
  description?: string;

  /**
   * Optional metadata about the action.
   *
   * Do NOT store passwords, API keys, tokens,
   * encrypted secrets, or other sensitive values here.
   */
  metadata?: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    /**
     * User who performed the action.
     */
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Action performed.
     */
    action: {
      type: String,
      enum: [
        "created",
        "updated",
        "deleted",
        "viewed",
        "copied",
        "archived",
        "restored",
      ],
      required: true,
      index: true,
    },

    /**
     * Type of entity affected.
     */
    entity: {
      type: String,
      enum: ["client", "project", "credential", "category", "tag"],
      required: true,
      index: true,
    },

    /**
     * ID of the affected document.
     *
     * This is intentionally a generic ObjectId because
     * an activity can belong to different entity types.
     */
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    /**
     * Human-readable activity description.
     */
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    /**
     * Additional non-sensitive activity information.
     *
     * Example:
     * {
     *   credentialName: "GitHub - Main Account"
     * }
     *
     * Never put secrets in metadata.
     */
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Main activity feed query.
 *
 * Example:
 * "Show the latest activity for this user."
 */
ActivitySchema.index(
  {
    owner: 1,
    createdAt: -1,
  },
  {
    name: "activity_owner_createdAt",
  },
);

/**
 * Entity-specific activity lookup.
 *
 * Example:
 * "Show all activity related to this credential."
 */
ActivitySchema.index(
  {
    owner: 1,
    entity: 1,
    entityId: 1,
    createdAt: -1,
  },
  {
    name: "activity_owner_entity_entityId_createdAt",
  },
);

/**
 * Useful when filtering activity by action.
 *
 * Example:
 * "Show all credential copy events."
 */
ActivitySchema.index(
  {
    owner: 1,
    action: 1,
    createdAt: -1,
  },
  {
    name: "activity_owner_action_createdAt",
  },
);

const Activity: Model<IActivity> =
  mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;
