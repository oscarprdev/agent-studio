import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/agents",
  "/prompts",
  "/skills",
  "/mcp",
  "/settings",
  "/onboarding",
];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAuthRoute(pathname: string): boolean {
  return pathname === "/login" || pathname === "/signup";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has("auth_token");

  if (hasToken && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!hasToken && isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
