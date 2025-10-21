"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Download, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";

interface ReportContentProps {
  type: string;
  data: any;
  isLoading: boolean;
  error?: string;
}

export function ReportContent({ type, data, isLoading, error }: ReportContentProps) {
  const [reportContent, setReportContent] = useState<any>(null);

  useEffect(() => {
    if (data && !isLoading) {
      setReportContent(data);
    }
  }, [data, isLoading]);

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "Failed to load report. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  if (!reportContent) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          No data available for this report. Try adjusting your filters or check back later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">{formatReportTitle(type)}</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ReportRenderer type={type} data={reportContent} />
        </CardContent>
      </Card>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function ReportRenderer({ type, data }: { type: string; data: any }) {
  // Implement different report visualizations based on the report type
  switch (type) {
    case "monthly-summary":
      return <MonthlySummaryReport data={data} />;
    case "platform-health":
      return <PlatformHealthReport data={data} />;
    case "user-activity":
      return <UserActivityReport data={data} />;
    case "report-creation":
      return <ReportCreationView data={data} />;
    default:
      return <GenericReport data={data} />;
  }
}

function MonthlySummaryReport({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Monthly Summary</h3>
      <p>This report provides a summary of activities for the month.</p>
      <pre className="bg-muted p-4 rounded-md overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function PlatformHealthReport({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Platform Health</h3>
      <p>This report provides metrics about platform performance and health.</p>
      <pre className="bg-muted p-4 rounded-md overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function UserActivityReport({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">User Activity</h3>
      <p>This report shows user engagement and activity metrics.</p>
      <pre className="bg-muted p-4 rounded-md overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function ReportCreationView({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Report Creation</h3>
      <p>Use this interface to create a new customized report.</p>
      <div className="grid gap-4">
        <p>Report creation interface would go here.</p>
        <p>This would typically include form elements for report configuration.</p>
      </div>
    </div>
  );
}

function GenericReport({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Report Data</h3>
      <pre className="bg-muted p-4 rounded-md overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function formatReportTitle(type: string): string {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
