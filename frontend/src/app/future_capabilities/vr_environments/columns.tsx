import { ColumnDef } from "@tanstack/react-table";
import { VREnvironmentConfig } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";

export const columns: ColumnDef<VREnvironmentConfig>[] = [
  {
    accessorKey: "environment_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Environment Name" />
    ),
  },
  {
    accessorKey: "access_level",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Access Level" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("access_level") as string;
      return (
        <div className="flex w-[100px] items-center">
          <span
            className={`capitalize ${
              value === "public"
                ? "text-green-600"
                : value === "private"
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {value}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
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


