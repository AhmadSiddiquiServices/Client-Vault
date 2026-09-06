import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(100),

  description: z.string().trim().max(500).optional(),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid category color.")
    .default("#00e676"),
});

/**
 * GET /api/categories
 *
 * Returns categories belonging to the authenticated user.
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

    const match: Record<string, unknown> = {
      owner: user._id,
    };

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");

      match.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    const categories = await Category.aggregate([
      {
        $match: match,
      },

      {
        $lookup: {
          from: "credentials",
          let: {
            categoryId: "$_id",
            ownerId: "$owner",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$category", "$$categoryId"],
                    },
                    {
                      $eq: ["$owner", "$$ownerId"],
                    },
                  ],
                },
              },
            },
            {
              $count: "count",
            },
          ],
          as: "credentialStats",
        },
      },

      {
        $addFields: {
          credentialsCount: {
            $ifNull: [
              {
                $arrayElemAt: ["$credentialStats.count", 0],
              },
              0,
            ],
          },
        },
      },

      {
        $project: {
          credentialStats: 0,
        },
      },

      {
        $sort: {
          name: 1,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        categories,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories.",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/categories
 *
 * Creates a category for the authenticated user.
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

    const result = createCategorySchema.safeParse(body);

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
      const category = await Category.create({
        ...result.data,
        owner: user._id,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Category created successfully.",
          category,
        },
        { status: 201 },
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
    console.error("POST /api/categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create category.",
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
