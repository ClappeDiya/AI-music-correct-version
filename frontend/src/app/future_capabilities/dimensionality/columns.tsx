import { ColumnDef } from "@tanstack/react-table";
import { DimensionalityModel } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const modelTypeColors = {
  pca: "bg-blue-500",
  tsne: "bg-green-500",
  umap: "bg-purple-500",
  autoencoder: "bg-yellow-500",
  custom: "bg-gray-500",
};

const statusColors = {
  active: "bg-green-500",
  training: "bg-blue-500",
  failed: "bg-red-500",
  archived: "bg-gray-500",
};

export const columns: ColumnDef<DimensionalityModel>[] = [
  {
    accessorKey: "model_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Model Name" />
    ),
  },
  {
    accessorKey: "model_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("model_type") as keyof typeof modelTypeColors;
      return (
        <Badge className={modelTypeColors[value]}>
          {value.toUpperCase()}
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
    accessorKey: "input_dimensions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Input Dims" />
    ),
    cell: ({ row }) => {
      const dims = row.getValue("input_dimensions") as Record<string, any>;
      return dims?.count ? (
        <Badge variant="outline">{dims.count}D</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "output_dimensions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Output Dims" />
    ),
    cell: ({ row }) => {
      const dims = row.getValue("output_dimensions") as Record<string, any>;
      return dims?.count ? (
        <Badge variant="outline">{dims.count}D</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "training_metrics",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Performance" />
    ),
    cell: ({ row }) => {
      const metrics = row.getValue("training_metrics") as Record<string, any>;
      return metrics?.accuracy ? (
        <Badge className={
          metrics.accuracy > 0.9 ? "bg-green-500" :
          metrics.accuracy > 0.7 ? "bg-yellow-500" :
          "bg-red-500"
        }>
          {Math.round(metrics.accuracy * 100)}%
        </Badge>
      ) : null;
    },
  },
  {
    accessorKey: "validation_results",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Validation" />
    ),
    cell: ({ row }) => {
      const results = row.getValue("validation_results") as Record<string, any>;
      return results?.validated ? (
        <Badge className={results.passed ? "bg-green-500" : "bg-red-500"}>
          {results.passed ? "Passed" : "Failed"}
        </Badge>
      ) : (
        <Badge variant="outline">Not Validated</Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



