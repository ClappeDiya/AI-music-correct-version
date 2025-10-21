import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/componen../ui/card";
import { useCharges } from "@/hooks/usecharges";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { ChargeFilter } from "@/types/billing/ChargeTypes";

const columns = [
  {
    accessorKey: "stripe_charge_id",
    header: "Charge ID",
  },
  {
    accessorKey: "amount_cents",
    header: "Amount",
    cell: ({ row }) =>
      formatCurrency(row.original.amount_cents / 100, row.original.currency),
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
          row.original.charge_data?.status === "succeeded"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {row.original.charge_data?.status}
      </span>
    ),
  },
];

export function ChargeList() {
  const [filters, setFilters] = useState<ChargeFilter>({});
  const { charges, isLoading, error } = useCharges(filters);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Charges</CardTitle>
        <CardDescription>View and manage payment charges</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4">
          <Input
            placeholder="Min amount"
            type="number"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                minAmount: e.target.valueAsNumber,
              }))
            }
          />
          <Input
            placeholder="Max amount"
            type="number"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                maxAmount: e.target.valueAsNumber,
              }))
            }
          />
          <Button variant="outline" onClick={() => setFilters({})}>
            Reset Filters
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={charges || []}
          isLoading={isLoading}
          error={error?.message}
        />
      </CardContent>
    </Card>
  );
}
