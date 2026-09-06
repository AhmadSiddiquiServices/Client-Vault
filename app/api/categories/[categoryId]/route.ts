import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";
import Credential from "@/models/Credential";

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(100),

  description: z.string().trim().max(500).optional(),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid category color.")
    .optional(),
});

interface RouteContext {
  params: Promise<{
    categoryId: string;
  }>;
}

/**
 * GET /api/categories/[categoryId]
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 },
      );
    }

    const { categoryId } = await context.params;

    if (!mongoose.isValidObjectId(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const category = await Category.findOne({
      _id: categoryId,
      owner: user._id,
    }).lean();

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        category,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/categories/[categoryId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch category.",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/categories/[categoryId]
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 },
      );
    }

    const { categoryId } = await context.params;

    if (!mongoose.isValidObjectId(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result = updateCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category data.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    try {
      const updateData: {
        name: string;
        description?: string;
        color?: string;
      } = {
        name: result.data.name,
      };

      if (result.data.description) {
        updateData.description = result.data.description;
      }

      if (result.data.color) {
        updateData.color = result.data.color;
      }

      const updateOperation: {
        $set: typeof updateData;
        $unset?: {
          description: string;
        };
      } = {
        $set: updateData,
      };

      if (!updateData.description) {
        delete updateOperation.$set.description;

        updateOperation.$unset = {
          description: "",
        };
      }

      const category = await Category.findOneAndUpdate(
        {
          _id: categoryId,
          owner: user._id,
        },
        updateOperation,
        {
          new: true,
          runValidators: true,
        },
      ).lean();

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            message: "Category not found.",
          },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Category updated successfully.",
          category,
        },
        { status: 200 },
      );
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return NextResponse.json(
          {
            success: false,
            message: "A category with this name already exists.",
          },
          { status: 409 },
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("PATCH /api/categories/[categoryId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update category.",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/categories/[categoryId]
 *
 * A category cannot be deleted while credentials
 * are still using it.
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 },
      );
    }

    const { categoryId } = await context.params;

    if (!mongoose.isValidObjectId(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const category = await Category.findOne({
      _id: categoryId,
      owner: user._id,
    }).select("_id");

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 },
      );
    }

    /**
     * Check whether any credentials use this category.
     *
     * Because credentials are owned by the same user,
     * this also prevents cross-user interference.
     */
    const credentialUsingCategory = await Credential.exists({
      owner: user._id,
      category: category._id,
    });

    if (credentialUsingCategory) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete this category because it is being used by one or more credentials. Reassign those credentials first.",
        },
        { status: 409 },
      );
    }

    await Category.deleteOne({
      _id: category._id,
      owner: user._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/categories/[categoryId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete category.",
      },
      { status: 500 },
    );
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}
