import { useApiQuery } from "@/lib/hooks/use-api-query";
import { royaltyTransactionsApi } from "@/lib/api/services";
import { DataTableView } from "../data-table/data-table-view";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { DatePickerWithRange } from "@/components/ui/DateRangePicker";
import {
  DollarSign,
  Download,
  TrendingUp,
  Calendar,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { addDays, format } from "date-fns";

const columns = [
  {
    accessorKey: "track.title",
    header: "Track",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        <span>
          {row.original.amount} {row.original.currency}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "transaction_type",
    header: "Type",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.transaction_type === "credit" ? "success" : "destructive"
        }
      >
        {row.original.transaction_type}
      </Badge>
    ),
  },
  {
    accessorKey: "transaction_date",
    header: "Date",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span>{format(new Date(row.original.transaction_date), "PP")}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
];

export function RoyaltyTransactions() {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 30),
  });
  const [transactionType, setTransactionType] = useState("all");

  const { data, isLoading } = useApiQuery("royalties", royaltyTransactionsApi, {
    transaction_date__gte: dateRange.from?.toISOString(),
    transaction_date__lte: dateRange.to?.toISOString(),
    transaction_type: transactionType !== "all" ? transactionType : undefined,
  });

  const totalEarnings =
    data?.results.reduce((sum, transaction) => {
      if (transaction.transaction_type === "credit") {
        return sum + transaction.amount;
      }
      return sum;
    }, 0) || 0;

  const totalDeductions =
    data?.results.reduce((sum, transaction) => {
      if (transaction.transaction_type === "debit") {
        return sum + transaction.amount;
      }
      return sum;
    }, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalEarnings.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deductions
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalDeductions.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalEarnings - totalDeductions).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Royalty Transactions</CardTitle>
          <CardDescription>
            Track your earnings and payments from music usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            <div className="w-[200px]">
              <Select
                value={transactionType}
                onValueChange={setTransactionType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credits</SelectItem>
                  <SelectItem value="debit">Debits</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <DataTableView
            columns={columns}
            data={data?.results || []}
            isLoading={isLoading}
            searchPlaceholder="Search transactions..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
