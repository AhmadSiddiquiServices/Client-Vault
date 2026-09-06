import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import Credential from "@/models/Credential";
import Tag from "@/models/Tag";

const updateTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tag name is required")
    .max(50, "Tag name must not exceed 50 characters"),
});

interface RouteContext {
  params: Promise<{
    tagId: string;
  }>;
}

/**
 * GET /api/tags/[tagId]
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

    const { tagId } = await context.params;

    if (!mongoose.isValidObjectId(tagId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid tag ID.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const tag = await Tag.findOne({
      _id: tagId,
      owner: user._id,
    }).lean();

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          message: "Tag not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        tag,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/tags/[tagId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tag.",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/tags/[tagId]
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

    const { tagId } = await context.params;

    if (!mongoose.isValidObjectId(tagId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid tag ID.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result = updateTagSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid tag data.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    try {
      const tag = await Tag.findOneAndUpdate(
        {
          _id: tagId,
          owner: user._id,
        },
        {
          $set: {
            name: result.data.name,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      ).lean();

      if (!tag) {
        return NextResponse.json(
          {
            success: false,
            message: "Tag not found.",
          },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Tag updated successfully.",
          tag,
        },
        { status: 200 },
      );
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return NextResponse.json(
          {
            success: false,
            message: "A tag with this name already exists.",
          },
          { status: 409 },
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("PATCH /api/tags/[tagId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update tag.",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/tags/[tagId]
 *
 * Removes the tag from all credentials belonging
 * to the authenticated user, then deletes the tag.
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

    const { tagId } = await context.params;

    if (!mongoose.isValidObjectId(tagId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid tag ID.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const tag = await Tag.findOne({
      _id: tagId,
      owner: user._id,
    }).select("_id");

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          message: "Tag not found.",
        },
        { status: 404 },
      );
    }

    /**
     * Remove this tag from all of the user's credentials.
     */
    await Credential.updateMany(
      {
        owner: user._id,
        tags: tag._id,
      },
      {
        $pull: {
          tags: tag._id,
        },
      },
    );

    /**
     * Now delete the tag itself.
     */
    await Tag.deleteOne({
      _id: tag._id,
      owner: user._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tag deleted successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/tags/[tagId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete tag.",
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
