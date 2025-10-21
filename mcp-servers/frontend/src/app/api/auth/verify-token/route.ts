import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { isTokenValid } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    const headersList = headers();
    const authHeader = headersList.get("Authorization");
    const cookieStore = cookies();
    
    // First try to get token from Authorization header
    let token = authHeader?.replace("Bearer ", "");
    
    // If no token in header, try to get from cookies
    if (!token) {
      token = cookieStore.get("accessToken")?.value;
    }

    if (!token || !isTokenValid(token)) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Sync user data with backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to verify with backend" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({
      authenticated: true,
      user: data.user || data,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 },
    );
  }
}

// Also support GET requests for auth checking
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token || !isTokenValid(token)) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 },
    );
  }
} 