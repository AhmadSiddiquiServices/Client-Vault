import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

const ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error(
    "Please define CREDENTIAL_ENCRYPTION_KEY in your .env.local file",
  );
}

const key = Buffer.from(ENCRYPTION_KEY, "base64");

if (key.length !== KEY_LENGTH) {
  throw new Error(
    "CREDENTIAL_ENCRYPTION_KEY must be a base64-encoded 32-byte key",
  );
}

/**
 * Encrypt plaintext using AES-256-GCM.
 *
 * Stored format:
 * version.iv.authTag.ciphertext
 */
export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

/**
 * Decrypt a value previously encrypted by encryptSecret().
 */
export function decryptSecret(payload: string): string {
  const [version, ivEncoded, authTagEncoded, encryptedEncoded] =
    payload.split(".");

  if (version !== "v1" || !ivEncoded || !authTagEncoded || !encryptedEncoded) {
    throw new Error("Invalid encrypted secret format");
  }

  const iv = Buffer.from(ivEncoded, "base64url");
  const authTag = Buffer.from(authTagEncoded, "base64url");
  const encrypted = Buffer.from(encryptedEncoded, "base64url");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
