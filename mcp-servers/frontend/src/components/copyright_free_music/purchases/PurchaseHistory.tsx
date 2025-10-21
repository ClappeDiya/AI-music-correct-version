import { useApiQuery } from "@/lib/hooks/use-api-query";
import { trackPurchasesApi } from "@/lib/api/services";
import { DataTableView } from "../data-table/data-table-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ShoppingCart,
  Download,
  FileCheck,
  Calendar,
  CreditCard,
} from "lucide-react";

const columns = [
  {
    accessorKey: "track.title",
    header: "Track",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span>{row.original.track.title}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span>
            {row.original.amount} {row.original.currency}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "purchased_at",
    header: "Purchase Date",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(row.original.purchased_at).toLocaleDateString()}
          </span>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <Badge variant="outline">
          {row.original.purchase_details?.status || "Completed"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <FileCheck className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export function PurchaseHistory() {
  const { data, isLoading } = useApiQuery("purchases", trackPurchasesApi);

  // Calculate total spent
  const totalSpent =
    data?.results.reduce((sum, purchase) => sum + purchase.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tracks Purchased
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.results.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableView
            columns={columns}
            data={data?.results || []}
            isLoading={isLoading}
            searchPlaceholder="Search purchases..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
