import { useApiQuery } from "@/lib/hooks/use-api-query";
import { licenseTermsApi } from "@/lib/api/services";
import { DataTableView } from "../data-table/data-table-view";
import { FileCheck, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { LicenseForm } from "./license-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import type { LicenseTerm } from "@/lib/api/types";

const columns = [
  {
    accessorKey: "license_name",
    header: "License Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <FileCheck className="h-4 w-4" />
          <span>{row.original.license_name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "base_conditions",
    header: "Conditions",
    cell: ({ row }) => {
      const conditions = row.original.base_conditions;
      return (
        <div className="space-y-1">
          {Object.entries(conditions || {}).map(([key, value]) => (
            <div key={key} className="text-sm">
              {key.replace("_", " ")}: {String(value)}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export function LicenseList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data, isLoading } = useApiQuery<LicenseTerm>(
    "licenses",
    licenseTermsApi,
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">License Terms</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <FileCheck className="h-4 w-4 mr-2" />
          Add License
        </Button>
      </div>

      <DataTableView
        columns={columns}
        data={data?.results || []}
        isLoading={isLoading}
        searchPlaceholder="Search licenses..."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add License Term</DialogTitle>
          </DialogHeader>
          <LicenseForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
