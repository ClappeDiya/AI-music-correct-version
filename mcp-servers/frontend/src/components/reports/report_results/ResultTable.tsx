"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { DataTable } from "../data-table";
import { columns } from "./columns";
import { reportResultsApi } from "@/lib/api/reports";
import { useState } from "react";
import { ResultDetailsDialog } from "./result-details-dialog";

export function ResultTable() {
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["report-results"],
    queryFn: async () => {
      const response = await reportResultsApi.list();
      return response.data;
    },
  });

  const handleViewDetails = (resultId: number) => {
    setSelectedResultId(resultId);
    setIsDetailsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Report Results</h2>
        <Button onClick={() => window.print()} variant="outline">
          Export All
        </Button>
      </div>
      <DataTable columns={columns} data={results} filterColumn="report" />
      {selectedResultId && (
        <ResultDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          resultId={selectedResultId}
        />
      )}
    </div>
  );
}
