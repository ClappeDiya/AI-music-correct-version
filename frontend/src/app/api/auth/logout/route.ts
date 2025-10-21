import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import type { ApiError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    // Get cookies from request
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json(
        { message: "Already logged out" },
        { status: 200 },
      );
    }

    // Forward request to Django with cookies
    await api.post("/auth/logout/", null, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    // Create response with cleared cookies
    const response = NextResponse.json({ message: "Logged out successfully" });

    // Clear cookies
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Logout error:", apiError);

    // Even if the backend logout fails, clear cookies on frontend
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 },
    );

    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
  }
}
