import { ColumnDef } from "@tanstack/react-table";
import { FeatureRoadmap } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const statusColors = {
  planned: "bg-blue-500",
  in_progress: "bg-yellow-500",
  completed: "bg-green-500",
  on_hold: "bg-gray-500",
};

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const visibilityColors = {
  public: "bg-green-500",
  internal: "bg-blue-500",
  confidential: "bg-red-500",
};

export const columns: ColumnDef<FeatureRoadmap>[] = [
  {
    accessorKey: "feature_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Feature Name" />
    ),
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
          {value.replace("_", " ").toUpperCase()}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priority_level",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("priority_level") as keyof typeof priorityColors;
      return <Badge className={priorityColors[value]}>{value.toUpperCase()}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "target_release_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Release Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("target_release_date") as string;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: "visibility",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visibility" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("visibility") as keyof typeof visibilityColors;
      return <Badge className={visibilityColors[value]}>{value}</Badge>;
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
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



