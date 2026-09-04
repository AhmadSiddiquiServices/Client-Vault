import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: "Logout successful.",
      },
      { status: 200 },
    );

    /**
     * Remove the authentication cookie.
     *
     * The cookie must use the same name/path as the
     * cookie created during login.
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
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
