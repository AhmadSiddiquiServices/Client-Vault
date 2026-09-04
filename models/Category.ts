import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  owner: mongoose.Types.ObjectId;

  name: string;
  description?: string;

  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    /**
     * User who owns this category.
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
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Category names should be unique for each user.
 *
 * This allows two different users to both have
 * a category called "Hosting", while preventing
 * duplicate "Hosting" categories for the same user.
 */
CategorySchema.index(
  {
    owner: 1,
    name: 1,
  },
  {
    unique: true,
    name: "category_owner_name_unique",
  },
);

/**
 * Useful for listing a user's categories.
 */
CategorySchema.index(
  {
    owner: 1,
    createdAt: -1,
  },
  {
    name: "category_owner_createdAt",
  },
);

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
