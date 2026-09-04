import mongoose, { Document, Model, Schema } from "mongoose";

export type ClientStatus = "active" | "inactive" | "archived";

export interface IClient extends Document {
  owner: mongoose.Types.ObjectId;

  name: string;
  company?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;

  status: ClientStatus;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    /**
     * User who owns this client.
     *
     * User → Clients
     */
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    company: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    contactPerson: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    website: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
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
 * Common client listing/filtering query.
 *
 * Example:
 * owner + status + newest first
 */
ClientSchema.index(
  { owner: 1, status: 1, createdAt: -1 },
  {
    name: "client_owner_status_createdAt",
  },
);

/**
 * Useful when retrieving a user's clients ordered
 * by recently updated records.
 */
ClientSchema.index(
  { owner: 1, updatedAt: -1 },
  {
    name: "client_owner_updatedAt",
  },
);

const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);

export default Client;
