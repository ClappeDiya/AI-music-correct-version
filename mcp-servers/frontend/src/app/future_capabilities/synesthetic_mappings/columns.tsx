import { ColumnDef } from "@tanstack/react-table";
import { SynestheticMapping } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const mappingTypeColors = {
  visual_audio: "bg-purple-500",
  audio_tactile: "bg-blue-500",
  color_emotion: "bg-green-500",
  custom: "bg-gray-500",
};

const validationColors = {
  pending: "bg-yellow-500",
  validated: "bg-green-500",
  experimental: "bg-purple-500",
  rejected: "bg-red-500",
};

export const columns: ColumnDef<SynestheticMapping>[] = [
  {
    accessorKey: "mapping_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mapping Name" />
    ),
  },
  {
    accessorKey: "mapping_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("mapping_type") as keyof typeof mappingTypeColors;
      return (
        <Badge className={mappingTypeColors[type]}>
          {type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "validation_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Validation" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("validation_status") as keyof typeof validationColors;
      return (
        <Badge className={validationColors[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "sensory_correlations",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Correlations" />
    ),
    cell: ({ row }) => {
      const correlations = row.getValue("sensory_correlations") as Record<string, any>;
      return correlations ? (
        <Badge variant="outline">
          {Object.keys(correlations).length} mappings
        </Badge>
      ) : null;
    },
  },
  {
    accessorKey: "access_scope",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Access" />
    ),
    cell: ({ row }) => {
      const scope = row.getValue("access_scope") as string;
      return (
        <Badge variant="outline">
          {scope.charAt(0).toUpperCase() + scope.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



