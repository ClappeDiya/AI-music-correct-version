import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import type { ApiError } from "@/lib/api";

export async function GET(request: Request) {
  try {
    // Get cookies from request
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Forward request to Django with cookies
    const response = await api.get("/auth/me/", {
      headers: {
        Cookie: cookieHeader,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Auth check error:", apiError);

    if (apiError.status === 401) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Authentication check failed" },
      { status: apiError.status || 500 },
    );
  }
}
