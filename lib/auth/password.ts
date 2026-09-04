import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password.
 *
 * The plaintext password must never be stored.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a password hash.
 */
export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
