import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "@/lib/auth/reset-token";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 },
      );
    }

    const { email } = result.data;

    await connectToDatabase();

    const user = await User.findOne({
      email,
      isActive: true,
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    /**
     * Always return the same response whether the email exists
     * or not. This prevents account/email enumeration.
     */
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists for this email, a password reset link has been sent.",
      });
    }

    const resetToken = generatePasswordResetToken();
    const resetTokenHash = hashPasswordResetToken(resetToken);

    const resetExpiresAt = new Date(Date.now() + 1000 * 60 * 30);

    user.passwordResetTokenHash = resetTokenHash;
    user.passwordResetExpiresAt = resetExpiresAt;

    await user.save();

    /**
     * Build the reset URL.
     */
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    /**
     * Temporary development behavior.
     *
     * Replace this with your email provider later.
     */
    if (process.env.NODE_ENV !== "production") {
      console.log("PASSWORD RESET URL:", resetUrl);
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists for this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
