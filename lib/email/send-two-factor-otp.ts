import { sendEmail } from "@/lib/email/send";
import { createTwoFactorOtpEmail } from "@/lib/email/templates/two-factor-otp";

type SendTwoFactorOtpOptions = {
  email: string;
  userName: string;
  otp: string;
  expiresInMinutes: number;
};

export async function sendTwoFactorOtp({
  email,
  userName,
  otp,
  expiresInMinutes,
}: SendTwoFactorOtpOptions) {
  const { html, text } = createTwoFactorOtpEmail({
    userName,
    otp,
    expiresInMinutes,
  });

  return sendEmail({
    to: email,
    subject: "Your ClientVault verification code",
    html,
    text,
  });
}
