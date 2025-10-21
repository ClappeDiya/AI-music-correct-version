import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import { trackPurchasesApi } from "@/lib/api/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { DataTableView } from "../data-table/data-table-view";
import {
  Music,
  DollarSign,
  Calendar,
  CreditCard,
  User,
  Download,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

const PAYMENT_STATUS_COLORS = {
  completed: "success",
  pending: "warning",
  failed: "destructive",
  refunded: "secondary",
};

export function TrackPurchasesManagement() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentProviderFilter, setPaymentProviderFilter] = useState("all");

  const { data, isLoading } = useApiQuery(
    "track-purchases",
    trackPurchasesApi,
    {
      created_at__gte: dateRange.from.toISOString(),
      created_at__lte: dateRange.to.toISOString(),
      status: statusFilter !== "all" ? statusFilter : undefined,
      payment_provider:
        paymentProviderFilter !== "all" ? paymentProviderFilter : undefined,
    },
  );

  const { update } = useApiMutation("track-purchases", trackPurchasesApi);

  const handleStatusUpdate = async (purchaseId: string, newStatus: string) => {
    await update.mutate({
      id: purchaseId,
      data: { status: newStatus },
    });
  };

  const columns = [
    {
      accessorKey: "track.title",
      header: "Track",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4" />
          <span>{row.original.track.title}</span>
        </div>
      ),
    },
    {
      accessorKey: "buyer.name",
      header: "Buyer",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{row.original.buyer.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span>${row.original.amount.toFixed(2)}</span>
        </div>
      ),
    },
    {
      accessorKey: "payment_provider",
      header: "Payment Method",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <Badge variant="outline">{row.original.payment_provider}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              PAYMENT_STATUS_COLORS[
                row.original.status as keyof typeof PAYMENT_STATUS_COLORS
              ]
            }
          >
            {row.original.status}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Purchase Date",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(row.original.created_at), "PP")}</span>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusUpdate(row.original.id, "completed")}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusUpdate(row.original.id, "failed")}
              >
                <XCircle className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
          {row.original.status === "completed" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusUpdate(row.original.id, "refunded")}
            >
              Refund
            </Button>
          )}
        </div>
      ),
    },
  ];

  const totalRevenue =
    data?.results.reduce(
      (sum, purchase) =>
        purchase.status === "completed" ? sum + purchase.amount : sum,
      0,
    ) || 0;

  const completedPurchases =
    data?.results.filter((purchase) => purchase.status === "completed")
      .length || 0;

  const conversionRate = data?.results.length
    ? (completedPurchases / data.results.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Purchases
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.results.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedPurchases} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Of total purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Purchase
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {completedPurchases
                ? (totalRevenue / completedPurchases).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Per completed purchase
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Track Purchases</CardTitle>
          <CardDescription>Manage and monitor track purchases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={dateRange.from.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      from: new Date(e.target.value),
                    }))
                  }
                />
                <Input
                  type="date"
                  value={dateRange.to.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      to: new Date(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Provider</Label>
              <Select
                value={paymentProviderFilter}
                onValueChange={setPaymentProviderFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline">Export Report</Button>
            </div>
          </div>

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
