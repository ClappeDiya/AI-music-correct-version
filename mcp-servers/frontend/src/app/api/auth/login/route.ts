import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import type { ApiError } from "@/lib/api";

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    is_staff: boolean;
    is_superuser: boolean;
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    try {
      const apiResponse = await api.post<LoginResponse>("/api/v1/auth/login/", {
        email,
        password,
      });

      const response = NextResponse.json(
        { user: apiResponse.data.user },
        { status: 200 },
      );

      // Set cookies more efficiently
      const cookies = apiResponse.headers["set-cookie"];
      if (cookies) {
        for (const cookie of cookies) {
          const [name, ...rest] = cookie.split("=");
          response.cookies.set(name, rest.join("=").split(";")[0], {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
        }
      }

      return response;
    } catch (error: unknown) {
      const err = error as ApiError;

      if (err.message?.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { error: "Unable to connect to server" },
          { status: 503 },
        );
      }

      return NextResponse.json(
        { error: err.response?.data?.error || "Authentication failed" },
        { status: err.response?.status || 500 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
