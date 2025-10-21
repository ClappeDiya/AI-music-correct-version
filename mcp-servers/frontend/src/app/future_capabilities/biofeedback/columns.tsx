import { ColumnDef } from "@tanstack/react-table";
import { BiofeedbackDataLog } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const dataTypeColors = {
  heart_rate: "bg-red-500",
  eeg: "bg-blue-500",
  gsr: "bg-green-500",
  emg: "bg-yellow-500",
  motion: "bg-purple-500",
  respiratory: "bg-indigo-500",
};

export const columns: ColumnDef<BiofeedbackDataLog>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Time" />
    ),
    cell: ({ row }) => {
      const timestamp = new Date(row.getValue("timestamp"));
      return (
        <div className="font-mono">
          {timestamp.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "user_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
  },
  {
    accessorKey: "session_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Session" />
    ),
    cell: ({ row }) => {
      const session = row.getValue("session_id") as string;
      return (
        <Badge variant="outline" className="font-mono">
          {session}
        </Badge>
      );
    },
  },
  {
    accessorKey: "data_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("data_type") as keyof typeof dataTypeColors;
      return (
        <Badge className={dataTypeColors[value]}>
          {value.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "data_value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Value" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("data_value") as Record<string, any>;
      return (
        <div className="max-w-[200px] truncate font-mono" title={JSON.stringify(value)}>
          {JSON.stringify(value)}
        </div>
      );
    },
  },
  {
    accessorKey: "quality_metrics",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quality" />
    ),
    cell: ({ row }) => {
      const metrics = row.getValue("quality_metrics") as Record<string, number>;
      const quality = metrics?.quality || 0;
      return (
        <Badge className={
          quality > 0.8 ? "bg-green-500" :
          quality > 0.6 ? "bg-yellow-500" :
          "bg-red-500"
        }>
          {Math.round(quality * 100)}%
        </Badge>
      );
    },
  },
  {
    accessorKey: "device_info",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Device" />
    ),
    cell: ({ row }) => {
      const info = row.getValue("device_info") as Record<string, any>;
      return info?.name ? (
        <Badge variant="outline">
          {info.name}
        </Badge>
      ) : null;
    },
  },
  {
    accessorKey: "analysis_results",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Analysis" />
    ),
    cell: ({ row }) => {
      const results = row.getValue("analysis_results") as Record<string, any>;
      const count = Object.keys(results || {}).length;
      return count ? (
        <Badge variant="outline">{count} metrics</Badge>
      ) : null;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



