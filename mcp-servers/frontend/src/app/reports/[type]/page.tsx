import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import { headers } from "next/headers";

import { ReportContent } from "@/components/reports/report-content";
import { getReportData } from "@/lib/api/reports";

// Define which reports should use static generation
const STATIC_REPORTS = ["monthly-summary", "platform-health"];

// Define revalidation periods for different report types
const REVALIDATE_PERIODS = {
  "monthly-summary": 86400, // 24 hours
  "platform-health": 3600, // 1 hour
  "user-activity": 300, // 5 minutes
  default: 60, // 1 minute
};

// Static params for build-time generation
export async function generateStaticParams() {
  return STATIC_REPORTS.map((type) => ({ type }));
}

interface ReportPageProps {
  params: { type: string };
  searchParams: Record<string, string | string[]>;
}

export default async function ReportPage(props: ReportPageProps) {
  // Destructure props separately to avoid dynamic object property access
  const type = props.params.type;
  
  // Get user context from headers
  const headersList = await headers();
  const userId = headersList.get("x-user-id");

  // Determine if this report should be static or dynamic
  const isStatic = STATIC_REPORTS.includes(type);
  const revalidate =
    REVALIDATE_PERIODS[type as keyof typeof REVALIDATE_PERIODS] ||
    REVALIDATE_PERIODS.default;

  try {
    // Construct a clean parameters object for the API
    const queryParams: Record<string, string> = {
      userId: userId || "",
    };
    
    // Safely extract individual search parameters
    if (typeof props.searchParams.startDate === 'string') {
      queryParams.startDate = props.searchParams.startDate;
    }
    
    if (typeof props.searchParams.endDate === 'string') {
      queryParams.endDate = props.searchParams.endDate;
    }
    
    if (typeof props.searchParams.format === 'string') {
      queryParams.format = props.searchParams.format;
    }
    
    // Fetch report data with appropriate caching strategy
    const reportData = await getReportData(type, {
      ...queryParams,
      next: {
        revalidate: isStatic ? false : revalidate,
      },
    });

    if (!reportData) {
      return notFound();
    }

    return (
      <main className="container mx-auto py-6">
        <Suspense
          fallback={
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <ReportContent
            type={type}
            data={reportData}
            isLoading={false}
          />
        </Suspense>
      </main>
    );
  } catch (error) {
    console.error(`Error loading report ${type}:`, error);
    return (
      <main className="container mx-auto py-6">
        <ReportContent
          type={type}
          data={null}
          isLoading={false}
          error={error instanceof Error ? error.message : "Failed to load report"}
        />
      </main>
    );
  }
}

// Generate metadata for the page
export function generateMetadata({
  params: { type },
}: {
  params: { type: string };
}) {
  const formattedType = capitalize(type);
  
  return {
    title: `${formattedType} Report | Music Platform`,
    description: `View and analyze the ${formattedType.toLowerCase()} report data and metrics.`,
  };
}

function capitalize(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
