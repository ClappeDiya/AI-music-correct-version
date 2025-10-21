"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { DataTable } from "../data-table";
import { columns } from "./columns";
import { reportSchedulesApi } from "@/lib/api/reports";
import { useState } from "react";
import { ScheduleDialog } from "./schedule-dialog";

export function ScheduleTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["report-schedules"],
    queryFn: async () => {
      const response = await reportSchedulesApi.list();
      return response.data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Report Schedules</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Schedule
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={schedules}
        filterColumn="schedule_cron"
      />
      <ScheduleDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
