import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth/password";
import { hashPasswordResetToken } from "@/lib/auth/reset-token";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import User from "@/models/User";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid password reset request.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { token, password } = result.data;

    await connectToDatabase();

    const tokenHash = hashPasswordResetToken(token);

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: {
        $gt: new Date(),
      },
      isActive: true,
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "This password reset link is invalid or has expired.",
        },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    user.passwordHash = passwordHash;

    /**
     * Reset tokens are single-use.
     */
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;

    /**
     * Force the user to authenticate again after changing
     * their password.
     */
    user.lastLoginAt = null;

    await user.save();

    const response = NextResponse.json({
      success: true,
      message:
        "Password reset successful. Please log in with your new password.",
    });

    /**
     * Remove any existing browser session.
     */
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
