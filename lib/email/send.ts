import { resend } from "@/lib/email/resend";

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const from =
    process.env.RESEND_FROM_EMAIL || "ClientVault <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  });

  if (error) {
    console.error("Resend email error:", error);

    throw new Error(error.message || "Failed to send email.");
  }

  return data;
}
