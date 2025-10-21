"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Translation } from "@/types/translation";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";

export const columns: ColumnDef<Translation>[] = [
  {
    accessorKey: "original_text",
    header: "Original Text",
  },
  {
    accessorKey: "translated_text",
    header: "Translated Text",
  },
  {
    accessorKey: "target_language",
    header: "Language",
    cell: ({ row }) => {
      const language = row.getValue("target_language");
      return <Badge variant="outline">{language}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return <Badge>{status}</Badge>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return format(date, "MMM dd, yyyy");
    },
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => {
      const date = new Date(row.getValue("updated_at"));
      return format(date, "MMM dd, yyyy");
    },
  },
];
