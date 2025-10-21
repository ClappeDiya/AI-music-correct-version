import { NextRequest, NextResponse } from "next/server";

/**
 * API route to verify the authentication state
 * This can be called from the client to check if authentication is working properly
 */
export async function GET(request: NextRequest) {
  // Get the cookie header from the request
  const cookieHeader = request.headers.get("cookie") || "";
  
  // Parse the cookies from the header
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").filter(Boolean).map(cookie => {
      const [name, value] = cookie.split("=");
      return [name, value];
    })
  );
  
  // Check if the dashboard_session cookie exists
  const hasDashboardSession = "dashboard_session" in cookies;
  
  // Return the authentication state
  return NextResponse.json({
    authenticated: hasDashboardSession,
    cookies: {
      dashboardSession: cookies.dashboard_session || null
    },
    message: hasDashboardSession 
      ? "Authentication session found" 
      : "No authentication session found"
  });
}
