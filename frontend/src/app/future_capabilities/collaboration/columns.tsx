import { ColumnDef } from "@tanstack/react-table";
import { CollaborationSession } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { Button } from '@/components/ui/Button';
import { PlayIcon, StopIcon } from "lucide-react";

export const columns: ColumnDef<CollaborationSession>[] = [
  {
    accessorKey: "session_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Session Name" />
    ),
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("active") as boolean;
      return (
        <div className="flex w-[100px] items-center">
          <span
            className={`capitalize ${
              value ? "text-green-600" : "text-red-600"
            }`}
          >
            {value ? "Active" : "Inactive"}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
    },
  },
  {
    accessorKey: "participant_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Participants" />
    ),
    cell: ({ row }) => {
      const participants = row.original.participant_user_ids as string[];
      return participants?.length || 0;
    },
  },
  {
    accessorKey: "moderator_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Moderators" />
    ),
    cell: ({ row }) => {
      const moderators = row.original.moderators as string[];
      return moderators?.length || 0;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const isActive = row.getValue("active") as boolean;
      const onActivate = (table.options.meta as any)?.onActivate;
      const onDeactivate = (table.options.meta as any)?.onDeactivate;

      return (
        <div className="flex items-center gap-2">
          {!isActive ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onActivate?.(row.original.id)}
              className="h-8 w-8 p-0"
            >
              <PlayIcon className="h-4 w-4 text-green-600" />
              <span className="sr-only">Activate session</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeactivate?.(row.original.id)}
              className="h-8 w-8 p-0"
            >
              <StopIcon className="h-4 w-4 text-red-600" />
              <span className="sr-only">Deactivate session</span>
            </Button>
          )}
        </div>
      );
    },
  },
];



