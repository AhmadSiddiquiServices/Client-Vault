import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { resendTwoFactorChallenge } from "@/lib/auth/two-factor";
import { sendTwoFactorOtp } from "@/lib/email/send-two-factor-otp";

import TwoFactorChallenge from "@/models/TwoFactorChallenge";
import User from "@/models/User";

export const runtime = "nodejs";

const resendTwoFactorSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = resendTwoFactorSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid resend request.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { challengeId } = result.data;

    await connectToDatabase();

    /**
     * Find the challenge first so we can identify
     * the user associated with it.
     */
    const existingChallenge = await TwoFactorChallenge.findById(challengeId);

    if (!existingChallenge) {
      return NextResponse.json(
        {
          success: false,
          message: "This verification request is invalid or has expired.",
        },
        { status: 400 },
      );
    }

    /**
     * A completed challenge cannot be resent.
     */
    if (existingChallenge.usedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "This verification request has already been completed.",
        },
        { status: 400 },
      );
    }

    /**
     * Make sure the account is still active.
     */
    const user = await User.findOne({
      _id: existingChallenge.user,
      isActive: true,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "This account is no longer available.",
        },
        { status: 403 },
      );
    }

    /**
     * Resend helper enforces the server-side cooldown.
     */
    const challenge = await resendTwoFactorChallenge(user._id, "login");

    if (!challenge.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${challenge.retryAfterSeconds} seconds before requesting another code.`,
          retryAfterSeconds: challenge.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(challenge.retryAfterSeconds),
          },
        },
      );
    }

    try {
      /**
       * Send the newly generated OTP.
       */
      await sendTwoFactorOtp({
        email: user.email,
        userName: user.name,
        otp: challenge.otp,
        expiresInMinutes: 10,
      });
    } catch (emailError) {
      /**
       * The challenge has already been replaced at this point.
       *
       * Remove it so the client does not hold a challenge
       * for an OTP that was never delivered.
       */
      await TwoFactorChallenge.deleteOne({
        _id: challenge.challengeId,
        user: user._id,
      });

      console.error("Failed to send 2FA resend email:", emailError);

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to send the new verification code. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "A new verification code has been sent.",
        challengeId: challenge.challengeId,
        expiresAt: challenge.expiresAt,
        resendAvailableAt: challenge.resendAvailableAt,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("2FA resend error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while sending the new verification code.",
      },
      { status: 500 },
    );
  }
}
