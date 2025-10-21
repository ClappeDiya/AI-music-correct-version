import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isTokenValid } from "@/utils/auth";

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

    return NextResponse.json({ valid: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 },
    );
  }
}
