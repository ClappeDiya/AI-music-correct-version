import { ColumnDef } from "@tanstack/react-table";
import { PipelineEvolution } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const evolutionTypeColors = {
  architecture: "bg-purple-500",
  parameter: "bg-blue-500",
  optimization: "bg-green-500",
  error_recovery: "bg-red-500",
  feature: "bg-yellow-500",
  security: "bg-orange-500",
};

const statusColors = {
  completed: "bg-green-500",
  in_progress: "bg-blue-500",
  failed: "bg-red-500",
  rolled_back: "bg-yellow-500",
};

export const columns: ColumnDef<PipelineEvolution>[] = [
  {
    accessorKey: "pipeline_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pipeline ID" />
    ),
  },
  {
    accessorKey: "evolution_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("evolution_type") as keyof typeof evolutionTypeColors;
      return (
        <Badge className={evolutionTypeColors[value]}>
          {value.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
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
    accessorKey: "changes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Changes" />
    ),
    cell: ({ row }) => {
      const changes = row.getValue("changes") as Record<string, any>[];
      return changes?.length ? (
        <Badge variant="outline">{changes.length} modifications</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "performance_impact",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Impact" />
    ),
    cell: ({ row }) => {
      const impact = row.getValue("performance_impact") as Record<string, any>;
      return impact?.score ? (
        <Badge className={
          impact.score > 0 ? "bg-green-500" :
          impact.score < 0 ? "bg-red-500" :
          "bg-yellow-500"
        }>
          {impact.score > 0 ? "+" : ""}{impact.score}%
        </Badge>
      ) : null;
    },
  },
  {
    accessorKey: "dependencies",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dependencies" />
    ),
    cell: ({ row }) => {
      const deps = row.getValue("dependencies") as string[];
      return deps?.length ? (
        <Badge variant="outline">{deps.length} affected</Badge>
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
      return results?.passed !== undefined ? (
        <Badge className={results.passed ? "bg-green-500" : "bg-red-500"}>
          {results.passed ? "Passed" : "Failed"}
        </Badge>
      ) : null;
    },
  },
  {
    accessorKey: "rollback_plan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rollback" />
    ),
    cell: ({ row }) => {
      const plan = row.getValue("rollback_plan") as Record<string, any>;
      return plan?.available ? (
        <Badge variant="outline" className="bg-green-500">Ready</Badge>
      ) : (
        <Badge variant="outline" className="bg-yellow-500">Not Available</Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



