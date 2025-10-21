import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that don't require authentication
const publicPaths = [
  "/", // Allow root path
  "/auth", // Allow all auth routes
  "/auth/login",
  "/auth/register",
  "/api/auth", // Allow NextAuth API routes
  "/_next", // Allow Next.js internals
  "/static", // Allow static files
  "/images", // Allow images
  "/favicon.ico", // Allow favicon
  "/api/v1", // Allow API routes
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and public paths
  if (
    pathname.includes("/_next") ||
    pathname.includes("/static") ||
    pathname.includes("/images") ||
    pathname.startsWith("/api/") ||
    pathname === "/" ||
    pathname.startsWith("/auth/") ||
    publicPaths.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  try {
    // Verify the session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If there's a token, allow the request
    if (token) {
      return NextResponse.next();
    }

    // If no token and trying to access dashboard, redirect to login
    if (pathname.startsWith("/dashboard")) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For other protected routes
    return NextResponse.redirect(new URL("/auth/login", request.url));
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Match all paths except static files and authentication routes
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth|auth).*)",
  ],
};
