import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/componen../ui/card";
import { useRefunds } from "@/hooks/userefunds";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { RefundFilter } from "@/types/billing/refund.types";
import { DateRangePicker } from "@/components/ui/daterangepicker";

const columns = [
  {
    accessorKey: "stripe_refund_id",
    header: "Refund ID",
  },
  {
    accessorKey: "charge_id",
    header: "Charge ID",
  },
  {
    accessorKey: "amount_cents",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.amount_cents / 100, "USD"),
  },
  {
    accessorKey: "reason",
    header: "Reason",
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          row.original.refund_data?.status === "succeeded"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {row.original.refund_data?.status}
      </span>
    ),
  },
];

export function RefundList() {
  const [filters, setFilters] = useState<RefundFilter>({});
  const { refunds, isLoading, error } = useRefunds(filters);

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setFilters((f) => ({
      ...f,
      dateFrom: range.from.toISOString(),
      dateTo: range.to.toISOString(),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refunds</CardTitle>
        <CardDescription>View and manage payment refunds</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4">
          <DateRangePicker onChange={handleDateRangeChange} />
          <Input
            placeholder="Charge ID"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                chargeId: e.target.value,
              }))
            }
          />
          <Button variant="outline" onClick={() => setFilters({})}>
            Reset Filters
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={refunds || []}
          isLoading={isLoading}
          error={error?.message}
        />
      </CardContent>
    </Card>
  );
}
