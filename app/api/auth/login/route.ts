import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import User from "@/models/User";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login details.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    await connectToDatabase();

    /**
     * passwordHash has select:false in User.ts,
     * so explicitly request it here.
     */
    const user = await User.findOne({
      email,
    }).select("+passwordHash");

    /**
     * Use the same generic response for a missing user
     * and an incorrect password.
     *
     * This avoids revealing whether an email exists.
     */
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "This account is inactive.",
        },
        { status: 403 },
      );
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    /**
     * Update the user's last login timestamp.
     */
    user.lastLoginAt = new Date();
    await user.save();

    /**
     * Create signed session token.
     */
    const sessionToken = await createSessionToken(user._id.toString());

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl ?? null,
        },
      },
      { status: 200 },
    );

    /**
     * Store the session in an HTTP-only cookie.
     */
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
