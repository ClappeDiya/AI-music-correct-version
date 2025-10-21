import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkPermission, sanitizeError } from "@/lib/security";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    roles: string[];
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user has admin permissions
    if (!checkPermission("admin", session.user.roles || [])) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const search = searchParams.get("search");

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (type) queryParams.append("type", type);
    if (startDate) queryParams.append("start_date", startDate);
    if (endDate) queryParams.append("end_date", endDate);
    if (search) queryParams.append("search", search);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/audit-logs/?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch audit logs: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching audit logs:", sanitizeError(error));
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user has admin permissions
    if (!checkPermission("admin", session.user.roles || [])) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const headers = new Headers(request.headers);

    // Add audit context
    const auditData = {
      ...body,
      ip_address: headers.get("x-forwarded-for") || "unknown",
      user_agent: headers.get("user-agent") || "unknown",
      user_id: session.user.id,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/audit-logs/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(auditData),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to create audit log: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating audit log:", sanitizeError(error));
    return new NextResponse("Internal server error", { status: 500 });
  }
}
