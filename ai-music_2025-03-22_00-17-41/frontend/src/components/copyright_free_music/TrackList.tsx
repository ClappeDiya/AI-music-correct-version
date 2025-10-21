import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tracksApi } from "@/lib/api/copyright_free_music";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Music, Download, FileCheck } from "lucide-react";
import { useToast } from "@/components/ui/useToast";

const columns = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4" />
          <span>{row.original.title}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "license.license_name",
    header: "License",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <FileCheck className="h-4 w-4" />
          <span>{row.original.license?.license_name}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(row.original.file_url)}
        >
          <Download className="h-4 w-4" />
        </Button>
      );
    },
  },
];

export function TrackList() {
  const [filters, setFilters] = useState({});
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tracks", filters],
    queryFn: () => tracksApi.list(filters),
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load tracks",
      variant: "destructive",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search tracks..."
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.results || []}
        isLoading={isLoading}
      />
    </div>
  );
}
