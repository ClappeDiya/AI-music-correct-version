import { ColumnDef } from "@tanstack/react-table";
import { ThirdPartyIntegration } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const integrationTypeColors = {
  authentication: "bg-blue-500",
  storage: "bg-green-500",
  analytics: "bg-purple-500",
  payment: "bg-yellow-500",
  communication: "bg-indigo-500",
  ai_service: "bg-orange-500",
};

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  error: "bg-red-500",
  pending: "bg-yellow-500",
};

export const columns: ColumnDef<ThirdPartyIntegration>[] = [
  {
    accessorKey: "integration_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Integration Name" />
    ),
  },
  {
    accessorKey: "provider",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Provider" />
    ),
  },
  {
    accessorKey: "integration_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("integration_type") as keyof typeof integrationTypeColors;
      return (
        <Badge className={integrationTypeColors[value]}>
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
    accessorKey: "api_configuration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="API Config" />
    ),
    cell: ({ row }) => {
      const config = row.getValue("api_configuration") as Record<string, any>;
      const count = Object.keys(config || {}).length;
      return count ? (
        <Badge variant="outline">{count} endpoints</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "data_mapping",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mappings" />
    ),
    cell: ({ row }) => {
      const mappings = row.getValue("data_mapping") as Record<string, any>;
      const count = Object.keys(mappings || {}).length;
      return count ? (
        <Badge variant="outline">{count} fields</Badge>
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
        <Badge variant="outline">{permissions.length} scopes</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "sync_settings",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sync" />
    ),
    cell: ({ row }) => {
      const settings = row.getValue("sync_settings") as Record<string, any>;
      return settings?.enabled ? (
        <Badge className="bg-green-500">Enabled</Badge>
      ) : (
        <Badge className="bg-gray-500">Disabled</Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



