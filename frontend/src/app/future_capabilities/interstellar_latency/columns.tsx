import { ColumnDef } from "@tanstack/react-table";
import { InterstellarLatencyConfig } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const configTypeColors = {
  deep_space: "bg-purple-500",
  planetary: "bg-blue-500",
  orbital: "bg-green-500",
  quantum: "bg-yellow-500",
  hybrid: "bg-indigo-500",
};

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  testing: "bg-blue-500",
  optimizing: "bg-yellow-500",
};

export const columns: ColumnDef<InterstellarLatencyConfig>[] = [
  {
    accessorKey: "config_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Configuration Name" />
    ),
  },
  {
    accessorKey: "config_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("config_type") as keyof typeof configTypeColors;
      return (
        <Badge className={configTypeColors[value]}>
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
    accessorKey: "latency_parameters",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Latency" />
    ),
    cell: ({ row }) => {
      const params = row.getValue("latency_parameters") as Record<string, any>;
      return params?.baseline ? (
        <Badge variant="outline">
          {params.baseline} ms
        </Badge>
      ) : null;
    },
  },
  {
    accessorKey: "compensation_strategies",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Strategies" />
    ),
    cell: ({ row }) => {
      const strategies = row.getValue("compensation_strategies") as string[];
      return strategies?.length ? (
        <Badge variant="outline">{strategies.length} active</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "routing_protocols",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Protocols" />
    ),
    cell: ({ row }) => {
      const protocols = row.getValue("routing_protocols") as Record<string, any>[];
      return protocols?.length ? (
        <Badge variant="outline">{protocols.length} configured</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "quantum_entanglement",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantum" />
    ),
    cell: ({ row }) => {
      const quantum = row.getValue("quantum_entanglement") as Record<string, any>;
      return quantum?.enabled ? (
        <Badge className={quantum.stability >= 0.8 ? "bg-green-500" : "bg-yellow-500"}>
          {Math.round(quantum.stability * 100)}% stable
        </Badge>
      ) : (
        <Badge variant="outline">Disabled</Badge>
      );
    },
  },
  {
    accessorKey: "performance_metrics",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Performance" />
    ),
    cell: ({ row }) => {
      const metrics = row.getValue("performance_metrics") as Record<string, any>;
      return metrics?.efficiency ? (
        <Badge className={
          metrics.efficiency >= 0.9 ? "bg-green-500" :
          metrics.efficiency >= 0.7 ? "bg-yellow-500" :
          "bg-red-500"
        }>
          {Math.round(metrics.efficiency * 100)}%
        </Badge>
      ) : null;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



