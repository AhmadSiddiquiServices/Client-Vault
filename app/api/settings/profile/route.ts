import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

/**
 * Only these profile fields are editable
 * through this endpoint.
 *
 * Email and role remain read-only.
 *
 * Profile image is handled by its own endpoint.
 */
const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(100, "Full name must be 100 characters or less."),
});

/**
 * Convert a user document into a safe
 * frontend response.
 */
function serializeProfile(user: {
  _id: unknown;
  name: string;
  email: string;
  profileImage?: {
    data?: Buffer;
    contentType?: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    _id: String(user._id),

    name: user.name,

    email: user.email,

    /*
     * Current ClientVault has one application role.
     * It is derived rather than stored on User.
     */
    role: "Administrator",

    /*
     * Don't return the image binary through
     * the normal profile API.
     */
    hasProfileImage: Boolean(user.profileImage?.data),

    createdAt: user.createdAt,

    updatedAt: user.updatedAt,
  };
}

/**
 * GET /api/settings/profile
 */
export async function GET() {
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

    const profile = await User.findOne({
      _id: user._id,
      isActive: true,
    })
      .select("name email profileImage createdAt updatedAt")
      .lean();

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "User profile not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,

        profile: serializeProfile(
          profile as unknown as Parameters<typeof serializeProfile>[0],
        ),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/settings/profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch profile.",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/settings/profile
 */
export async function PATCH(request: Request) {
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

    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid profile data.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const profile = await User.findOneAndUpdate(
      {
        _id: user._id,
        isActive: true,
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
    )
      .select("name email profileImage createdAt updatedAt")
      .lean();

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "User profile not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully.",

        profile: serializeProfile(
          profile as unknown as Parameters<typeof serializeProfile>[0],
        ),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/settings/profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile.",
      },
      { status: 500 },
    );
  }
}
