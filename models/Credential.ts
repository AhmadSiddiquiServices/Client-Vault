import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICustomField {
  label: string;
  value: string;
  isSecret: boolean;
}

export interface ICredential extends Document {
  owner: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;

  projects: mongoose.Types.ObjectId[];

  name: string;
  category: mongoose.Types.ObjectId;

  username?: string;

  /**
   * Encrypted sensitive value.
   *
   * This should NEVER contain the plaintext secret.
   */
  secret?: string;

  url?: string;

  customFields: ICustomField[];

  tags: mongoose.Types.ObjectId[];

  notes?: string;

  isFavorite: boolean;
  isShared: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const CustomFieldSchema = new Schema<ICustomField>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    value: {
      type: String,
      required: true,
    },

    isSecret: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const CredentialSchema = new Schema<ICredential>(
  {
    /**
     * User who owns this credential.
     */
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Client this credential belongs to.
     */
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    /**
     * Projects using this credential.
     *
     * A credential can belong to one project or
     * be shared across multiple projects.
     */
    projects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    /**
     * Credential category.
     *
     * Examples:
     * Hosting, Development, Database, Cloud, etc.
     */
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    /**
     * Username, email, account name, etc.
     *
     * This is not treated as the encrypted secret.
     */
    username: {
      type: String,
      trim: true,
      maxlength: 255,
    },

    /**
     * Encrypted credential secret.
     *
     * Examples:
     * - Password
     * - API key
     * - API secret
     * - Access token
     * - SSH key
     * - Connection string
     *
     * IMPORTANT:
     * Never save plaintext secrets here.
     */
    secret: {
      type: String,
      select: false,
    },

    url: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    /**
     * Flexible service-specific fields.
     *
     * Secret custom-field values must also be encrypted
     * before being saved.
     */
    customFields: {
      type: [CustomFieldSchema],
      default: [],
    },

    /**
     * Multiple tags can be attached to a credential.
     */
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],

    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    /**
     * Whether this credential appears in Favorites.
     */
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },

    /**
     * True when the credential is shared across
     * multiple projects.
     */
    isShared: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Main credential listing query.
 *
 * Useful for:
 * - All credentials for a user
 * - Recently updated credentials
 */
CredentialSchema.index(
  {
    owner: 1,
    updatedAt: -1,
  },
  {
    name: "credential_owner_updatedAt",
  },
);

/**
 * Client credential listing.
 *
 * Useful for:
 * "Show all credentials belonging to this client"
 */
CredentialSchema.index(
  {
    owner: 1,
    client: 1,
    updatedAt: -1,
  },
  {
    name: "credential_owner_client_updatedAt",
  },
);

/**
 * Category filtering.
 */
CredentialSchema.index(
  {
    owner: 1,
    category: 1,
  },
  {
    name: "credential_owner_category",
  },
);

/**
 * Favorites filtering.
 *
 * Example:
 * {
 *   owner: userId,
 *   isFavorite: true
 * }
 */
CredentialSchema.index(
  {
    owner: 1,
    isFavorite: 1,
    updatedAt: -1,
  },
  {
    name: "credential_owner_favorite_updatedAt",
  },
);

/**
 * Shared credential filtering.
 */
CredentialSchema.index(
  {
    owner: 1,
    isShared: 1,
    updatedAt: -1,
  },
  {
    name: "credential_owner_shared_updatedAt",
  },
);

/**
 * Project-based credential lookup.
 *
 * MongoDB supports indexing array fields, so this allows
 * efficient queries against projects[].
 */
CredentialSchema.index(
  {
    owner: 1,
    projects: 1,
  },
  {
    name: "credential_owner_projects",
  },
);

const Credential: Model<ICredential> =
  mongoose.models.Credential ||
  mongoose.model<ICredential>("Credential", CredentialSchema);

export default Credential;
