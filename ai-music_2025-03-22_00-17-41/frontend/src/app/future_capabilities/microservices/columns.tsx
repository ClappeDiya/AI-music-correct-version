import { ColumnDef } from "@tanstack/react-table";
import { MicroserviceRegistry } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  deprecated: "bg-red-500",
  development: "bg-blue-500",
};

const securityColors = {
  public: "bg-green-500",
  internal: "bg-blue-500",
  confidential: "bg-orange-500",
  restricted: "bg-red-500",
};

export const columns: ColumnDef<MicroserviceRegistry>[] = [
  {
    accessorKey: "service_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Service Name" />
    ),
  },
  {
    accessorKey: "version",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Version" />
    ),
    cell: ({ row }) => {
      const version = row.getValue("version") as string;
      return (
        <Badge variant="outline" className="font-mono">
          v{version}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("status") as keyof typeof statusColors;
      return (
        <Badge className={statusColors[value]}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "security_classification",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Security" />
    ),
    cell: ({ row }) => {
      const value = row.getValue(
        "security_classification"
      ) as keyof typeof securityColors;
      return (
        <Badge className={securityColors[value]}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-[300px] truncate" title={description}>
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "endpoints",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Endpoints" />
    ),
    cell: ({ row }) => {
      const endpoints = row.getValue("endpoints") as Record<string, any>[];
      return endpoints?.length || 0;
    },
  },
  {
    accessorKey: "dependencies",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dependencies" />
    ),
    cell: ({ row }) => {
      const dependencies = row.getValue("dependencies") as string[];
      return dependencies?.length || 0;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



