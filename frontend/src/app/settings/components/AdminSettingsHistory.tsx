"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "@/components/ui/usetoast";
import { Button } from "@/components/ui/Button";
import { Undo, User } from "lucide-react";

interface AdminSettingsHistoryItem {
  id: string;
  userId: string;
  username: string;
  version: number;
  changedAt: string;
  settings: Record<string, any>;
  isEphemeral: boolean;
  fusionId?: string;
}

const columns: ColumnDef<AdminSettingsHistoryItem>[] = [
  {
    accessorKey: "username",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span>{row.getValue("username")}</span>
      </div>
    ),
  },
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ row }) => `v${row.getValue("version")}`,
  },
  {
    accessorKey: "changedAt",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("changedAt")).toLocaleString(),
  },
  {
    accessorKey: "isEphemeral",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.getValue("isEphemeral") ? "Ephemeral" : "Persistent"}
      </span>
    ),
  },
  {
    accessorKey: "fusionId",
    header: "Fusion",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.getValue("fusionId") ? `Fusion ${row.getValue("fusionId")}` : "-"}
      </span>
    ),
  },
];

export default function AdminSettingsHistory() {
  const [history, setHistory] = useState<AdminSettingsHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch("/api/admin/settings/history");
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch settings history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) {
    return <div>Loading history...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">User Settings History</h3>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <Undo className="mr-2 h-4 w-4" />
          Refresh History
        </Button>
      </div>
      <DataTable columns={columns} data={history} searchKey="username" />
    </div>
  );
}
