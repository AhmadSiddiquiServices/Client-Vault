// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

// export async function proxy(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
//   const session = sessionToken ? await verifySessionToken(sessionToken) : null;
//   const isAuthenticated = !!session;

//   /**
//    * Protect dashboard pages.
//    */
//   if (pathname.startsWith("/dashboard")) {
//     if (!isAuthenticated) {
//       const loginUrl = new URL("/login", request.url);

//       return NextResponse.redirect(loginUrl);
//     }

//     return NextResponse.next();
//   }

//   /**
//    * Prevent authenticated users from visiting auth pages.
//    *
//    * Example:
//    * Already logged in → /login
//    * → redirect to /dashboard
//    */
//   if (
//     isAuthenticated &&
//     (pathname === "/login" ||
//       pathname === "/forgot-password" ||
//       pathname === "/reset-password")
//   ) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/login",
//     "/forgot-password",
//     "/reset-password",
//   ],
// };
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/clients",
  "/projects",
  "/credentials",
  "/categories",
  "/tags",
  "/activity",
  "/settings",
];

const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password"];

function isRouteMatch(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const session = sessionToken ? await verifySessionToken(sessionToken) : null;

  const isAuthenticated = Boolean(session);

  /**
   * ----------------------------------------
   * Protect authenticated application pages.
   * ----------------------------------------
   */
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    isRouteMatch(pathname, route),
  );

  if (isProtectedRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);

      /*
       * Preserve the page the user originally
       * attempted to visit.
       *
       * Example:
       *
       * /credentials/123/edit
       *      ↓
       * /login?redirect=/credentials/123/edit
       */
      loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  /**
   * ----------------------------------------
   * Prevent authenticated users from
   * accessing authentication pages.
   * ----------------------------------------
   */
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    isRouteMatch(pathname, route),
  );

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/projects/:path*",
    "/credentials/:path*",
    "/categories/:path*",
    "/tags/:path*",
    "/activity/:path*",
    "/settings/:path*",

    "/login",
    "/forgot-password",
    "/reset-password",
  ],
};
