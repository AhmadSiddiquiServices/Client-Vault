import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICategory extends Document {
  owner: Types.ObjectId;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
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

    color: {
      type: String,
      required: true,
      default: "#00e676",
      match: /^#[0-9A-Fa-f]{6}$/,
    },
  },
  {
    timestamps: true,
  },
);

CategorySchema.index(
  { owner: 1, name: 1 },
  {
    unique: true,
    name: "category_owner_name_unique",
  },
);

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
