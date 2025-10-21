import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Session {
  access_token: string;
  user: {
    id: string;
    email: string;
  };
}

export async function GET(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/invoices/`;
    const queryParams = new URLSearchParams();
    if (status) {
      queryParams.append("status", status);
    }

    const response = await fetch(
      `${apiUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
