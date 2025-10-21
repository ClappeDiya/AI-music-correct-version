import { ColumnDef } from "@tanstack/react-table";
import { AIAgentPartnership } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const statusColors = {
  active: "bg-green-500",
  training: "bg-blue-500",
  suspended: "bg-yellow-500",
  retired: "bg-gray-500",
};

const securityColors = {
  basic: "bg-gray-500",
  enhanced: "bg-blue-500",
  advanced: "bg-purple-500",
  maximum: "bg-red-500",
};

export const columns: ColumnDef<AIAgentPartnership>[] = [
  {
    accessorKey: "agent_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agent Name" />
    ),
  },
  {
    accessorKey: "associated_task",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => {
      const task = row.getValue("associated_task") as string;
      return task ? (
        <div className="max-w-[300px] truncate" title={task}>
          {task}
        </div>
      ) : null;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusColors;
      return (
        <Badge className={statusColors[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "security_clearance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Security" />
    ),
    cell: ({ row }) => {
      const security = row.getValue("security_clearance") as keyof typeof securityColors;
      return (
        <Badge className={securityColors[security]}>
          {security.charAt(0).toUpperCase() + security.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "personality_profile",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Personality" />
    ),
    cell: ({ row }) => {
      const profile = row.getValue("personality_profile") as Record<string, any>;
      return profile ? (
        <Badge variant="outline">
          {Object.keys(profile).length} traits
        </Badge>
      ) : null;
    },
  },
  {
    accessorKey: "expiration_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expires" />
    ),
    cell: ({ row }) => {
      const time = row.getValue("expiration_time") as string;
      return time ? (
        <Badge variant="outline">
          {new Date(time).toLocaleDateString()}
        </Badge>
      ) : (
        <Badge variant="outline">Never</Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



