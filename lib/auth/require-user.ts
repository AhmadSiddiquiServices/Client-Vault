import { getCurrentUser } from "@/lib/auth/current-user";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return user;
}
