import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Get the refresh token - need to use direct access without storing cookieStore
    const refreshToken = cookies().get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token available" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Create the response object
    const responseObj = NextResponse.json({ success: true });
    
    // Set the cookie on the response object
    responseObj.cookies.set("accessToken", data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return responseObj;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 },
    );
  }
}
