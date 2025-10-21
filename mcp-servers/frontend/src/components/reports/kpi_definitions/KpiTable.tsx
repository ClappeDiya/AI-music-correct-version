"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { DataTable } from "../data-table";
import { columns } from "./columns";
import { kpiDefinitionsApi } from "@/lib/api/reports";
import { useState } from "react";
import { KPIDefinitionDialog } from "./kpi-definition-dialog";

export function KPITable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: kpis = [], isLoading } = useQuery({
    queryKey: ["kpi-definitions"],
    queryFn: async () => {
      const response = await kpiDefinitionsApi.list();
      return response.data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold tracking-tight">KPI Definitions</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New KPI
        </Button>
      </div>
      <DataTable columns={columns} data={kpis} filterColumn="kpi_name" />
      <KPIDefinitionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
