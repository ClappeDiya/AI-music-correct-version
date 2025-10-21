import { ColumnDef } from "@tanstack/react-table";
import { UserStyleProfile } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const styleColors = {
  classical: "bg-purple-500",
  jazz: "bg-blue-500",
  electronic: "bg-green-500",
  rock: "bg-red-500",
  custom: "bg-orange-500",
};

export const columns: ColumnDef<UserStyleProfile>[] = [
  {
    accessorKey: "profile_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Profile Name" />
    ),
  },
  {
    accessorKey: "user_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
  },
  {
    accessorKey: "style_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Style" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("style_type") as keyof typeof styleColors;
      return (
        <Badge className={styleColors[value]}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <Badge className={isActive ? "bg-green-500" : "bg-gray-500"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
    },
  },
  {
    accessorKey: "preferences",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Preferences" />
    ),
    cell: ({ row }) => {
      const preferences = row.getValue("preferences") as Record<string, any>;
      const count = Object.keys(preferences || {}).length;
      return count ? (
        <Badge variant="outline">{count} items</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "instrument_settings",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Instruments" />
    ),
    cell: ({ row }) => {
      const settings = row.getValue("instrument_settings") as Record<string, any>;
      const count = Object.keys(settings || {}).length;
      return count ? (
        <Badge variant="outline">{count} configured</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "visualization_settings",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visuals" />
    ),
    cell: ({ row }) => {
      const settings = row.getValue("visualization_settings") as Record<string, any>;
      const count = Object.keys(settings || {}).length;
      return count ? (
        <Badge variant="outline">{count} configured</Badge>
      ) : null;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



