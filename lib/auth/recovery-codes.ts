import crypto from "crypto";

const RECOVERY_CODE_COUNT = 10;
const RECOVERY_CODE_LENGTH = 16;

const RECOVERY_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function getRecoveryCodeHashSecret(): string {
  const secret = process.env.RECOVERY_CODE_HASH_SECRET;

  if (!secret) {
    throw new Error(
      "Please define RECOVERY_CODE_HASH_SECRET in your .env.local file",
    );
  }

  return secret;
}

export function generateRecoveryCode(): string {
  let value = "";

  for (let index = 0; index < RECOVERY_CODE_LENGTH; index += 1) {
    const randomIndex = crypto.randomInt(0, RECOVERY_CODE_ALPHABET.length);

    value += RECOVERY_CODE_ALPHABET[randomIndex];
  }

  return value.match(/.{1,4}/g)!.join("-");
}

export function generateRecoveryCodes(): string[] {
  return Array.from({ length: RECOVERY_CODE_COUNT }, () =>
    generateRecoveryCode(),
  );
}

export function normalizeRecoveryCode(code: string): string {
  return code.replace(/[-\s]/g, "").toUpperCase();
}

export function hashRecoveryCode(code: string): string {
  return crypto
    .createHmac("sha256", getRecoveryCodeHashSecret())
    .update(normalizeRecoveryCode(code), "utf8")
    .digest("hex");
}

export function verifyRecoveryCode(code: string, storedHash: string): boolean {
  try {
    const candidateHash = Buffer.from(hashRecoveryCode(code), "hex");

    const expectedHash = Buffer.from(storedHash, "hex");

    if (candidateHash.length !== expectedHash.length) {
      return false;
    }

    return crypto.timingSafeEqual(candidateHash, expectedHash);
  } catch {
    return false;
  }
}

export { RECOVERY_CODE_COUNT, RECOVERY_CODE_LENGTH };
