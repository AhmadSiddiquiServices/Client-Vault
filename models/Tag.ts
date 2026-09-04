import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITag extends Document {
  owner: mongoose.Types.ObjectId;

  name: string;

  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    /**
     * User who owns this tag.
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
      maxlength: 50,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * A tag name must be unique for each user.
 *
 * This allows different users to have a tag
 * with the same name while preventing duplicates
 * within the same user's vault.
 */
TagSchema.index(
  {
    owner: 1,
    name: 1,
  },
  {
    unique: true,
    name: "tag_owner_name_unique",
  },
);

/**
 * Useful for listing a user's tags.
 */
TagSchema.index(
  {
    owner: 1,
    createdAt: -1,
  },
  {
    name: "tag_owner_createdAt",
  },
);

const Tag: Model<ITag> =
  mongoose.models.Tag || mongoose.model<ITag>("Tag", TagSchema);

export default Tag;
