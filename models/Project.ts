import mongoose, { Document, Model, Schema } from "mongoose";

export type ProjectType =
  | "website"
  | "shopify-store"
  | "mobile-app"
  | "api"
  | "saas"
  | "internal-system"
  | "server"
  | "other";

export type ProjectStatus = "active" | "inactive" | "completed" | "archived";

export interface IProject extends Document {
  owner: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;

  name: string;
  type: ProjectType;

  url?: string;
  description?: string;
  status: ProjectStatus;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    /**
     * User who owns this project.
     */
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Client this project belongs to.
     *
     * Client → Projects
     */
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    /**
     * General project type.
     *
     * The project model intentionally isn't limited
     * to websites.
     */
    type: {
      type: String,
      enum: [
        "website",
        "shopify-store",
        "mobile-app",
        "api",
        "saas",
        "internal-system",
        "server",
        "other",
      ],
      required: true,
      default: "website",
      index: true,
    },

    url: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "completed", "archived"],
      default: "active",
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Main project listing query.
 *
 * Useful for:
 * - All projects belonging to a user
 * - Recently created projects
 */
ProjectSchema.index(
  {
    owner: 1,
    createdAt: -1,
  },
  {
    name: "project_owner_createdAt",
  },
);

/**
 * Client → Projects lookup.
 *
 * Useful for:
 * "Show all projects for this client"
 */
ProjectSchema.index(
  {
    owner: 1,
    client: 1,
    createdAt: -1,
  },
  {
    name: "project_owner_client_createdAt",
  },
);

/**
 * Project filtering by status.
 */
ProjectSchema.index(
  {
    owner: 1,
    status: 1,
    updatedAt: -1,
  },
  {
    name: "project_owner_status_updatedAt",
  },
);

/**
 * Project type filtering.
 */
ProjectSchema.index(
  {
    owner: 1,
    type: 1,
  },
  {
    name: "project_owner_type",
  },
);

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
