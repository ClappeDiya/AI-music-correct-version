import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkPermission, sanitizeError } from "@/lib/security";

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
    const { filter, dateRange, searchTerm } = body;

    const queryParams = new URLSearchParams();
    if (filter !== "all") queryParams.append("type", filter);
    if (dateRange.start) queryParams.append("start_date", dateRange.start);
    if (dateRange.end) queryParams.append("end_date", dateRange.end);
    if (searchTerm) queryParams.append("search", searchTerm);
    queryParams.append("format", "csv");

    // Log the export attempt
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/audit-logs/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "audit_log_export",
          user_id: session.user.id,
          details: {
            filter,
            dateRange,
            searchTerm,
          },
          timestamp: new Date().toISOString(),
        }),
      },
    );

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing-management/audit-logs/export/?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to export audit logs: ${response.status}`);
    }

    const csvData = await response.text();

    // Sanitize the CSV data to remove any sensitive information
    const sanitizedCsvData = csvData
      .split("\n")
      .map((line) => {
        const columns = line.split(",");
        // Mask sensitive columns (e.g., user IDs, IP addresses)
        return columns
          .map((col, index) => {
            // Assuming column 3 is user ID and column 4 is IP address
            if (index === 3 || index === 4) {
              return col.replace(/[^@\s,]+/g, "•••••");
            }
            return col;
          })
          .join(",");
      })
      .join("\n");

    return new NextResponse(sanitizedCsvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=audit-logs-${new Date().toISOString()}.csv`,
        // Add security headers
        "Content-Security-Policy": "default-src 'none'",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error exporting audit logs:", sanitizeError(error));
    return new NextResponse("Internal server error", { status: 500 });
  }
}
