import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

// List of public routes that don't require authentication
const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// List of routes that should handle URL params without redirecting
const queryParamRoutes = [
  "/settings",
];

// Helper function to check if token is expired
function isTokenExpired(token: string): boolean {
  try {
    // Check if token is a non-empty string
    if (!token || typeof token !== 'string') {
      return true; // Consider empty or non-string tokens as expired
    }
    
    // Validate token format first
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      // Instead of logging an error, silently return true for invalid tokens
      // This avoids filling console with errors for normal operation
      return true; // Consider invalid tokens as expired
    }
    
    // Now try to decode it
    const decoded = jwtDecode<{ exp: number }>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if exp exists in decoded token
    if (!decoded || typeof decoded.exp !== 'number') {
      return true; // Token doesn't have a valid expiration
    }
    
    return decoded.exp < currentTime;
  } catch (error) {
    // Only log errors in development mode
    if (process.env.NODE_ENV === "development") {
      console.debug("[Token Validation] Error checking token expiration - considering token expired");
    }
    return true; // If there's an error decoding, consider the token expired
  }
}

// Helper function to log information in development - avoid duplicate logs within a time window
const logCache = new Map<string, number>();
const LOG_EXPIRY = 10000; // 10 seconds between identical logs

function logInfo(message: string, data?: any) {
  if (process.env.NODE_ENV === "development") {
    const key = `${message}-${JSON.stringify(data || '')}`;
    const now = Date.now();
    const lastLogTime = logCache.get(key) || 0;
    
    // Only log if we haven't logged the same message recently
    if (now - lastLogTime > LOG_EXPIRY) {
      console.log(`[Middleware] ${message}`, data || '');
      logCache.set(key, now);
      
      // Cleanup old entries
      if (logCache.size > 100) {
        for (const [k, v] of logCache.entries()) {
          if (now - v > LOG_EXPIRY) {
            logCache.delete(k);
          }
        }
      }
    }
  }
}

// Helper function to check if route is dashboard or subdirectory
function isDashboardRoute(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/") || 
         pathname === "/project/dashboard" || pathname.startsWith("/project/dashboard/");
}

// Helper function to check if route is a settings route
function isSettingsRoute(pathname: string): boolean {
  return pathname === "/settings" || pathname.startsWith("/settings/");
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const fullPath = `${pathname}${search}`;
  
  // Check if the route is public
  if (publicRoutes.includes(pathname)) {
    logInfo(`Access to public route: ${pathname}`);
    return NextResponse.next();
  }
  
  // Special handling for routes with query params
  for (const route of queryParamRoutes) {
    if (pathname === route && search) {
      const accessToken = request.cookies.get("accessToken")?.value;
      const refreshToken = request.cookies.get("refreshToken")?.value;
      const dashboardCookie = request.cookies.get("dashboard_session")?.value;
      
      // If there are any auth indicators, allow the request to proceed
      if (accessToken || refreshToken || dashboardCookie === "active") {
        // For the settings route, we'll handle auth in the component
        return NextResponse.next();
      }
    }
  }
  
  // Special handling for dashboard - Simplified permissive check
  if (isDashboardRoute(pathname)) {
    // If this is the old dashboard path, redirect to the new one
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      logInfo(`Redirecting from old dashboard path to new project dashboard`);
      const newDashboardUrl = new URL("/project/dashboard", request.url);
      return NextResponse.redirect(newDashboardUrl);
    }
    
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    
    // If there's ANY token at all, always allow dashboard access
    if (accessToken || refreshToken) {
      logInfo(`Dashboard access granted with tokens`);
      return NextResponse.next();
    }
    
    // Look for special cookie marker as fallback
    const dashboardCookie = request.cookies.get("dashboard_session")?.value;
    if (dashboardCookie === "active") {
      logInfo(`Dashboard access granted with session cookie`);
      return NextResponse.next();
    }
    
    // If no auth indicators at all, redirect to login
    logInfo(`No auth for dashboard, redirecting to login`);
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Special handling for settings routes
  if (isSettingsRoute(pathname)) {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const dashboardCookie = request.cookies.get("dashboard_session")?.value;
    
    // If there are any auth indicators, allow the request to proceed
    if (accessToken || refreshToken || dashboardCookie === "active") {
      // For the settings route, we'll handle auth in the component
      return NextResponse.next();
    }
    
    // If no auth indicators at all, redirect to login
    logInfo(`No auth for settings, redirecting to login`);
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect_url", fullPath);
    return NextResponse.redirect(loginUrl);
  }

  // Check for authentication token for all other routes
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  logInfo(`Request to ${pathname}`, { 
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenExpired: accessToken ? isTokenExpired(accessToken) : true
  });

  // If no tokens are present, redirect to login
  if (!accessToken && !refreshToken) {
    logInfo(`No tokens found, redirecting to login`);
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect_url", fullPath);
    return NextResponse.redirect(loginUrl);
  }

  // If access token exists but is expired, and we have a refresh token
  if (accessToken && isTokenExpired(accessToken) && refreshToken) {
    logInfo(`Access token expired but refresh token exists, proceeding to client-side refresh`);
    // Allow the client-side code to handle token refresh
    return NextResponse.next();
  }

  // If access token exists and is not expired, or refresh token might be used
  logInfo(`Authentication check passed for ${pathname}`);
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
