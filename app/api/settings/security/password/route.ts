import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import User from "@/models/User";

export const runtime = "nodejs";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),

  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long.")
    .max(128, "New password must not exceed 128 characters."),
});

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

    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid password change request.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = result.data;

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be different from your current password.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const dbUser = await User.findOne({
      _id: user._id,
      isActive: true,
    }).select("+passwordHash");

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User account not found.",
        },
        { status: 404 },
      );
    }

    const passwordMatches = await verifyPassword(
      currentPassword,
      dbUser.passwordHash,
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect.",
        },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(newPassword);

    dbUser.passwordHash = passwordHash;

    /**
     * Force re-authentication after a password change.
     *
     * The current browser session will be invalidated below.
     */
    dbUser.lastLoginAt = null;

    await dbUser.save();

    const response = NextResponse.json(
      {
        success: true,
        message: "Password changed successfully. Please log in again.",
      },
      { status: 200 },
    );

    /**
     * Remove the current session.
     */
    response.cookies.set({
      name: "clientvault_session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("POST /api/settings/security/password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to change password.",
      },
      { status: 500 },
    );
  }
}
