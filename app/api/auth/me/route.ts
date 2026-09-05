import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";

export async function GET() {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl ?? null,
        lastLoginAt: user.lastLoginAt ?? null,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Current user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load current user.",
      },
      { status: 500 },
    );
  }
}
