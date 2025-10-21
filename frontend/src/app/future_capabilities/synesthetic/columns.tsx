import { ColumnDef } from "@tanstack/react-table";
import { SynestheticMapping } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const mappingTypeColors = {
  sound_color: "bg-purple-500",
  color_sound: "bg-blue-500",
  motion_sound: "bg-green-500",
  sound_texture: "bg-yellow-500",
  emotion_sound: "bg-pink-500",
  custom: "bg-gray-500",
};

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  testing: "bg-blue-500",
  archived: "bg-red-500",
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
      const value = row.getValue("mapping_type") as keyof typeof mappingTypeColors;
      return (
        <Badge className={mappingTypeColors[value]}>
          {value.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" → ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
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
    accessorKey: "input_modality",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Input" />
    ),
    cell: ({ row }) => {
      const modality = row.getValue("input_modality") as Record<string, any>;
      return modality?.type ? (
        <Badge variant="outline">
          {modality.type.charAt(0).toUpperCase() + modality.type.slice(1)}
        </Badge>
      ) : null;
    },
  },
  {
    accessorKey: "output_modality",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Output" />
    ),
    cell: ({ row }) => {
      const modality = row.getValue("output_modality") as Record<string, any>;
      return modality?.type ? (
        <Badge variant="outline">
          {modality.type.charAt(0).toUpperCase() + modality.type.slice(1)}
        </Badge>
      ) : null;
    },
  },
  {
    accessorKey: "mapping_rules",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rules" />
    ),
    cell: ({ row }) => {
      const rules = row.getValue("mapping_rules") as Record<string, any>[];
      return rules?.length ? (
        <Badge variant="outline">{rules.length} rules</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "neural_correlates",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Neural" />
    ),
    cell: ({ row }) => {
      const correlates = row.getValue("neural_correlates") as Record<string, any>;
      return correlates?.confidence ? (
        <Badge className={
          correlates.confidence >= 0.8 ? "bg-green-500" :
          correlates.confidence >= 0.6 ? "bg-yellow-500" :
          "bg-red-500"
        }>
          {Math.round(correlates.confidence * 100)}%
        </Badge>
      ) : null;
    },
  },
  {
    accessorKey: "validation_metrics",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Validation" />
    ),
    cell: ({ row }) => {
      const metrics = row.getValue("validation_metrics") as Record<string, any>;
      return metrics?.score ? (
        <Badge className={
          metrics.score >= 0.8 ? "bg-green-500" :
          metrics.score >= 0.6 ? "bg-yellow-500" :
          "bg-red-500"
        }>
          {Math.round(metrics.score * 100)}%
        </Badge>
      ) : null;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



