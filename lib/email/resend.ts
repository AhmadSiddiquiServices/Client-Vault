import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error("Please define RESEND_API_KEY in your .env.local file");
}

export const resend = new Resend(apiKey);
