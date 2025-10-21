import { ColumnDef } from "@tanstack/react-table";
import { AIPluginRegistry } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

export const columns: ColumnDef<AIPluginRegistry>[] = [
  {
    accessorKey: "plugin_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plugin Name" />
    ),
  },
  {
    accessorKey: "version",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Version" />
    ),
  },
  {
    accessorKey: "access_level",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Access Level" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("access_level") as string;
      return (
        <Badge
          variant={
            value === "public"
              ? "default"
              : value === "private"
              ? "destructive"
              : "secondary"
          }
        >
          {value}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "approved",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("approved") as boolean;
      return (
        <Badge
          variant={value ? "default" : "secondary"}
          className={value ? "bg-green-500" : "bg-yellow-500"}
        >
          {value ? "Approved" : "Pending"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
    },
  },
  {
    accessorKey: "plugin_description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const description = row.getValue("plugin_description") as string;
      return (
        <div className="max-w-[500px] truncate" title={description}>
          {description}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



