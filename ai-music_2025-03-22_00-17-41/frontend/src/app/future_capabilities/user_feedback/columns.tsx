import { ColumnDef } from "@tanstack/react-table";
import { UserFeedbackLog } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const statusColors = {
  new: "bg-blue-500",
  in_review: "bg-purple-500",
  in_progress: "bg-yellow-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
};

const typeColors = {
  bug_report: "bg-red-500",
  feature_request: "bg-blue-500",
  improvement: "bg-green-500",
  general: "bg-gray-500",
  performance: "bg-yellow-500",
  ui_ux: "bg-purple-500",
};

export const columns: ColumnDef<UserFeedbackLog>[] = [
  {
    accessorKey: "user_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User ID" />
    ),
  },
  {
    accessorKey: "feedback_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("feedback_type") as keyof typeof typeColors;
      return (
        <Badge className={typeColors[value]}>
          {value.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "satisfaction_rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      const rating = Number(row.getValue("satisfaction_rating"));
      const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
      return (
        <span className="font-mono" title={`${rating} out of 5 stars`}>
          {stars}
        </span>
      );
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("priority") as keyof typeof priorityColors;
      return (
        <Badge className={priorityColors[value]}>
          {value.toUpperCase()}
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
          {value.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "feedback_content",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Content" />
    ),
    cell: ({ row }) => {
      const content = row.getValue("feedback_content") as string;
      return (
        <div className="max-w-[300px] truncate" title={content}>
          {content}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return new Date(row.getValue("created_at")).toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



