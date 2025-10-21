"use client";

import { Suspense } from "react";
import { headers } from "next/headers";
import { Loader2 } from "lucide-react";

import { getPrecomputedMetrics } from "@/lib/api/reports";
import { KPIGrid } from "@/components/reports/dashboard/kpi-grid";

// Revalidate KPIs every 5 minutes
export const revalidate = 300;

export default async function KPIDefinitionsPage() {
  const headersList = headers();
  const userId = headersList.get("x-user-id");

  // Fetch precomputed KPI data
  const kpiData = await getPrecomputedMetrics("kpis", { userId });

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Key Performance Indicators
        </h2>
        <p className="text-muted-foreground">
          Track your platform's performance metrics
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <KPIGrid data={kpiData} />
      </Suspense>
    </div>
  );
}
