"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { DataTable } from "../data-table";
import { columns } from "./columns";
import { reportsApi } from "@/lib/api/reports";
import { useState } from "react";
import { ReportDialog } from "./report-dialog";
import { ShareReportDialog } from "./share-report-dialog";

export function ReportTable() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const response = await reportsApi.list();
      return response.data;
    },
  });

  const handleShare = (reportId: number) => {
    setSelectedReportId(reportId);
    setIsShareDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            Export All
          </Button>
          <Button asChild>
            <Link href="/reports/create">
              <Plus className="mr-2 h-4 w-4" /> New Report
            </Link>
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={reports} filterColumn="report_name" />
      <ReportDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      {selectedReportId && (
        <ShareReportDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          reportId={selectedReportId}
        />
      )}
    </div>
  );
}
