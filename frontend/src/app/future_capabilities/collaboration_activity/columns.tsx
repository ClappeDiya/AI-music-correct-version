import { ColumnDef } from "@tanstack/react-table";
import { CollaborationActivityLog } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const actionColors = {
  join: "bg-green-500",
  leave: "bg-red-500",
  message: "bg-blue-500",
  edit: "bg-yellow-500",
  share: "bg-purple-500",
  control: "bg-orange-500",
};

export const columns: ColumnDef<CollaborationActivityLog>[] = [
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
    accessorKey: "session",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Session" />
    ),
    cell: ({ row }) => {
      const session = row.getValue("session") as string;
      return (
        <Badge variant="outline" className="font-mono">
          {session}
        </Badge>
      );
    },
  },
  {
    accessorKey: "action_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("action_type") as keyof typeof actionColors;
      return (
        <Badge className={actionColors[value]}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "action_detail",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Details" />
    ),
    cell: ({ row }) => {
      const detail = row.getValue("action_detail") as string;
      return (
        <div className="max-w-[300px] truncate" title={detail}>
          {detail}
        </div>
      );
    },
  },
  {
    accessorKey: "metadata",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Metadata" />
    ),
    cell: ({ row }) => {
      const metadata = row.getValue("metadata") as Record<string, any>;
      const count = Object.keys(metadata || {}).length;
      return count ? (
        <Badge variant="outline">{count} items</Badge>
      ) : null;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



