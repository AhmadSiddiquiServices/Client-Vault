import crypto from "crypto";

const RESET_TOKEN_BYTES = 32;

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
}

export function hashPasswordResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
