import { ColumnDef } from "@tanstack/react-table";
import { SemanticLayer } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const complexityColors = {
  basic: "bg-blue-500",
  intermediate: "bg-yellow-500",
  advanced: "bg-orange-500",
  expert: "bg-red-500",
};

const accessColors = {
  read_only: "bg-blue-500",
  write: "bg-yellow-500",
  full_access: "bg-green-500",
};

export const columns: ColumnDef<SemanticLayer>[] = [
  {
    accessorKey: "layer_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Layer Name" />
    ),
  },
  {
    accessorKey: "layer_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("layer_type") as string;
      return (
        <Badge variant="outline">
          {value.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "complexity_level",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Complexity" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("complexity_level") as keyof typeof complexityColors;
      return (
        <Badge className={complexityColors[value]}>
          {value.toUpperCase()}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "access_mode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Access" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("access_mode") as keyof typeof accessColors;
      return (
        <Badge className={accessColors[value]}>
          {value.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
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
    accessorKey: "integration_points",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Integrations" />
    ),
    cell: ({ row }) => {
      const integrations = row.getValue("integration_points") as string[];
      return integrations?.length || 0;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



