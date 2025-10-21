import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { UserBehaviorEvent, TrackAnalyticsAggregate } from "@/types/analytics";

export interface AnalyticsColumnProps {
  data: UserBehaviorEvent | TrackAnalyticsAggregate;
}

export const AnalyticsColumns: ColumnDef<
  UserBehaviorEvent | TrackAnalyticsAggregate
>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("timestamp"));
      return date.toLocaleString();
    },
  },
  {
    accessorKey: "event_type",
    header: "Event Type",
    cell: ({ row }) => {
      const eventType = row.getValue("event_type");
      return <span className="capitalize">{eventType}</span>;
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => {
      const details = row.getValue("details") as Record<string, unknown>;
      return (
        <div className="max-w-[200px] truncate">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="font-medium">{key}:</span> {String(value)}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    },
  },
];
