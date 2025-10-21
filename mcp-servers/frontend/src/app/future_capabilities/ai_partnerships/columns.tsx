import { ColumnDef } from "@tanstack/react-table";
import { AIPartnership } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const partnershipTypeColors = {
  research: "bg-purple-500",
  commercial: "bg-blue-500",
  open_source: "bg-green-500",
  educational: "bg-yellow-500",
  government: "bg-red-500",
};

const statusColors = {
  active: "bg-green-500",
  pending: "bg-yellow-500",
  suspended: "bg-red-500",
  terminated: "bg-gray-500",
};

export const columns: ColumnDef<AIPartnership>[] = [
  {
    accessorKey: "partner_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Partner Name" />
    ),
  },
  {
    accessorKey: "partnership_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("partnership_type") as keyof typeof partnershipTypeColors;
      return (
        <Badge className={partnershipTypeColors[value]}>
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
    accessorKey: "capabilities",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Capabilities" />
    ),
    cell: ({ row }) => {
      const capabilities = row.getValue("capabilities") as string[];
      return capabilities?.length ? (
        <Badge variant="outline">{capabilities.length} capabilities</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "integration_details",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Integration" />
    ),
    cell: ({ row }) => {
      const details = row.getValue("integration_details") as Record<string, any>;
      return details?.status ? (
        <Badge className={
          details.status === "connected" ? "bg-green-500" :
          details.status === "partial" ? "bg-yellow-500" :
          "bg-red-500"
        }>
          {details.status.charAt(0).toUpperCase() + details.status.slice(1)}
        </Badge>
      ) : null;
    },
  },
  {
    accessorKey: "performance_metrics",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Performance" />
    ),
    cell: ({ row }) => {
      const metrics = row.getValue("performance_metrics") as Record<string, any>;
      return metrics?.score ? (
        <Badge className={
          metrics.score >= 90 ? "bg-green-500" :
          metrics.score >= 70 ? "bg-yellow-500" :
          "bg-red-500"
        }>
          {metrics.score}%
        </Badge>
      ) : null;
    },
  },
  {
    accessorKey: "compliance_info",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Compliance" />
    ),
    cell: ({ row }) => {
      const info = row.getValue("compliance_info") as Record<string, any>;
      return info?.compliant ? (
        <Badge className="bg-green-500">Compliant</Badge>
      ) : (
        <Badge className="bg-red-500">Non-Compliant</Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



