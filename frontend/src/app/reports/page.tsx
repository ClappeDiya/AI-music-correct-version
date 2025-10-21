"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ReportTable, ReportFilters } from "./components";
import { useReports } from "@/services/ReportsService";

export default function ReportsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
    type: "all",
    status: "all",
    search: "",
  });

  const { data: reports, isLoading } = useReports(filters);

  const handleCreateReport = () => {
    router.push("/reports/report-creation");
  };

  const handleViewReport = (id: string) => {
    router.push(`/reports/results/${id}`);
  };

  const handleDownloadReport = async (id: string) => {
    // Implementation for downloading report
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button onClick={handleCreateReport}>Create Report</Button>
      </div>

      <div className="space-y-6">
        <ReportFilters filters={filters} onFilterChange={setFilters} />

        <ReportTable
          data={reports ?? []}
          onView={handleViewReport}
          onDownload={handleDownloadReport}
        />
      </div>
    </div>
  );
}
