import { ColumnDef } from "@tanstack/react-table";
import { MiniAppRegistry } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const appTypeColors = {
  visualization: "bg-purple-500",
  audio_effect: "bg-blue-500",
  instrument: "bg-green-500",
  analysis: "bg-yellow-500",
  utility: "bg-gray-500",
  game: "bg-pink-500",
};

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  development: "bg-blue-500",
  deprecated: "bg-red-500",
};

export const columns: ColumnDef<MiniAppRegistry>[] = [
  {
    accessorKey: "app_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="App Name" />
    ),
  },
  {
    accessorKey: "version",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Version" />
    ),
    cell: ({ row }) => {
      const version = row.getValue("version") as string;
      return (
        <Badge variant="outline" className="font-mono">
          v{version}
        </Badge>
      );
    },
  },
  {
    accessorKey: "app_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("app_type") as keyof typeof appTypeColors;
      return (
        <Badge className={appTypeColors[value]}>
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
    accessorKey: "entry_points",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Entry Points" />
    ),
    cell: ({ row }) => {
      const entryPoints = row.getValue("entry_points") as Record<string, any>;
      const count = Object.keys(entryPoints || {}).length;
      return count ? (
        <Badge variant="outline">{count} routes</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "dependencies",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dependencies" />
    ),
    cell: ({ row }) => {
      const deps = row.getValue("dependencies") as Record<string, string>;
      const count = Object.keys(deps || {}).length;
      return count ? (
        <Badge variant="outline">{count} packages</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "permissions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Permissions" />
    ),
    cell: ({ row }) => {
      const permissions = row.getValue("permissions") as string[];
      return permissions?.length ? (
        <Badge variant="outline">{permissions.length} required</Badge>
      ) : null;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



