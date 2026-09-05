import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import Tag from "@/models/Tag";

const createTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tag name is required")
    .max(50, "Tag name must not exceed 50 characters"),
});

/**
 * GET /api/tags
 *
 * Returns tags belonging to the authenticated user.
 *
 * Supported query parameter:
 * - search
 */
export async function GET(request: Request) {
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

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    const query: Record<string, unknown> = {
      owner: user._id,
    };

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");

      query.name = searchRegex;
    }

    const tags = await Tag.find(query).sort({ name: 1 }).lean();

    return NextResponse.json(
      {
        success: true,
        tags,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/tags error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tags.",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/tags
 *
 * Creates a tag for the authenticated user.
 */
export async function POST(request: Request) {
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

    const body = await request.json();

    const result = createTagSchema.safeParse(body);

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
      const tag = await Tag.create({
        owner: user._id,
        name: result.data.name,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Tag created successfully.",
          tag,
        },
        { status: 201 },
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
    console.error("POST /api/tags error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create tag.",
      },
      { status: 500 },
    );
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}
