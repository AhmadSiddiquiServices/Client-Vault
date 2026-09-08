import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type AllowedImageType = (typeof ALLOWED_TYPES)[number];

function hasValidImageSignature(buffer: Buffer, contentType: AllowedImageType) {
  /*
   * JPEG
   */
  if (contentType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  /*
   * PNG
   */
  if (contentType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  /*
   * WEBP
   *
   * RIFF....WEBP
   */
  if (contentType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  return false;
}

/**
 * POST /api/settings/profile/image
 *
 * Upload or replace profile picture.
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

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile image is required.",
        },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected image is empty.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile image must be 2MB or smaller.",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type as AllowedImageType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG and WebP images are allowed.",
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    if (!hasValidImageSignature(buffer, file.type as AllowedImageType)) {
      return NextResponse.json(
        {
          success: false,
          message: "The uploaded file is not a valid image.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        isActive: true,
      },
      {
        $set: {
          profileImage: {
            data: buffer,
            contentType: file.type,
          },
        },
      },
      {
        new: true,
      },
    )
      .select("name email profileImage updatedAt")
      .lean();

    if (!updatedUser) {
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
        message: "Profile picture updated successfully.",
        hasProfileImage: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/settings/profile/image error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile picture.",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/settings/profile/image
 *
 * Returns the authenticated user's profile image.
 */
export async function GET() {
  try {
    const user = await requireUser();

    if (!user) {
      return new NextResponse("Authentication required.", {
        status: 401,
      });
    }

    await connectToDatabase();

    const profile = await User.findOne({
      _id: user._id,
      isActive: true,
    })
      .select("profileImage")
      .lean();

    if (!profile?.profileImage?.data) {
      return new NextResponse("Profile image not found.", {
        status: 404,
      });
    }

    /*
     * Normalize MongoDB/Mongoose binary data
     * into a Node Buffer.
     */
    const rawData = profile.profileImage.data as
      | Buffer
      | {
          buffer?: Buffer;
          value?: () => Buffer;
        };

    let imageBuffer: Buffer;

    if (Buffer.isBuffer(rawData)) {
      imageBuffer = rawData;
    } else if (
      rawData &&
      typeof rawData === "object" &&
      Buffer.isBuffer(rawData.buffer)
    ) {
      imageBuffer = rawData.buffer;
    } else if (
      rawData &&
      typeof rawData === "object" &&
      typeof rawData.value === "function"
    ) {
      imageBuffer = Buffer.from(rawData.value());
    } else {
      imageBuffer = Buffer.from(rawData as unknown as Uint8Array);
    }

    const contentType =
      profile.profileImage.contentType || "application/octet-stream";

    /*
     * NextResponse's TypeScript definition does not
     * directly accept Node's Buffer generic type.
     *
     * At runtime Buffer is a valid byte body, so we
     * explicitly cast it to BodyInit.
     */
    return new NextResponse(imageBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": contentType,

        "Content-Length": String(imageBuffer.length),

        "Cache-Control": "private, no-store, max-age=0",

        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GET /api/settings/profile/image error:", error);

    return new NextResponse("Failed to fetch profile image.", {
      status: 500,
    });
  }
}

/**
 * DELETE /api/settings/profile/image
 */
export async function DELETE() {
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

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        isActive: true,
      },
      {
        $unset: {
          profileImage: 1,
        },
      },
      {
        new: true,
      },
    )
      .select("name email profileImage updatedAt")
      .lean();

    if (!updatedUser) {
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
        message: "Profile picture removed successfully.",
        hasProfileImage: false,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/settings/profile/image error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove profile picture.",
      },
      { status: 500 },
    );
  }
}
