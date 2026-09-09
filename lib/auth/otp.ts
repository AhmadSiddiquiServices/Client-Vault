import crypto from "crypto";

const OTP_LENGTH = 6;

export const OTP_EXPIRATION_MS = 10 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure 6-digit OTP.
 *
 * Example:
 * "048219"
 */
export function generateOtp(): string {
  const maximum = 10 ** OTP_LENGTH;

  const value = crypto.randomInt(0, maximum);

  return value.toString().padStart(OTP_LENGTH, "0");
}

/**
 * Get the secret used to protect OTP hashes.
 *
 * OTPs only contain 1,000,000 possible values, so using a
 * plain SHA-256 hash would allow offline brute-force attacks
 * if the database were compromised.
 *
 * HMAC with a server-side secret prevents that.
 */
function getOtpHashSecret(): string {
  const secret = process.env.OTP_HASH_SECRET;

  if (!secret) {
    throw new Error("Please define OTP_HASH_SECRET in your .env.local file");
  }

  return secret;
}

/**
 * Create a keyed HMAC hash of the OTP.
 *
 * The plaintext OTP is never stored.
 */
export function hashOtp(otp: string): string {
  return crypto
    .createHmac("sha256", getOtpHashSecret())
    .update(otp, "utf8")
    .digest("hex");
}

/**
 * Verify a plaintext OTP against a stored HMAC hash.
 *
 * timingSafeEqual prevents ordinary timing-based comparison
 * differences.
 */
export function verifyOtp(otp: string, storedHash: string): boolean {
  try {
    const candidateHash = Buffer.from(hashOtp(otp), "hex");
    const expectedHash = Buffer.from(storedHash, "hex");

    if (candidateHash.length !== expectedHash.length) {
      return false;
    }

    return crypto.timingSafeEqual(candidateHash, expectedHash);
  } catch {
    return false;
  }
}

/**
 * Check whether a challenge has expired.
 */
export function isOtpExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}

/**
 * Check whether enough time has passed since the last
 * OTP was sent.
 */
export function isOtpResendAllowed(lastSentAt: Date): boolean {
  return Date.now() - lastSentAt.getTime() >= OTP_RESEND_COOLDOWN_MS;
}

/**
 * Get the number of seconds remaining before resend
 * becomes available.
 */
export function getOtpResendCooldownSeconds(lastSentAt: Date): number {
  const remainingMs =
    OTP_RESEND_COOLDOWN_MS - (Date.now() - lastSentAt.getTime());

  if (remainingMs <= 0) {
    return 0;
  }

  return Math.ceil(remainingMs / 1000);
}
