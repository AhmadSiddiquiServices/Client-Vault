import { cookies } from "next/headers";

import { connectToDatabase } from "@/lib/mongodb";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import User from "@/models/User";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await verifySessionToken(sessionToken);

  if (!session) {
    return null;
  }

  await connectToDatabase();

  const user = await User.findById(session.userId).lean();

  if (!user) {
    return null;
  }

  if (!user.isActive) {
    return null;
  }

  return user;
}
