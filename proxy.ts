import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;
  const isAuthenticated = !!session;

  /**
   * Protect dashboard pages.
   */
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  /**
   * Prevent authenticated users from visiting auth pages.
   *
   * Example:
   * Already logged in → /login
   * → redirect to /dashboard
   */
  if (
    isAuthenticated &&
    (pathname === "/login" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/forgot-password",
    "/reset-password",
  ],
};
