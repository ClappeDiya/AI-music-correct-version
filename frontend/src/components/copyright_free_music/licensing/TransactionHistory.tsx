import { useApiQuery } from "@/lib/hooks/use-api-query";
import { licensePurchasesApi } from "@/lib/api/services";
import { LicensePurchase } from "@/lib/api/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Receipt,
  Download,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function TransactionHistory() {
  const { data: transactions, isLoading } = useApiQuery(
    "license-purchases",
    () => licensePurchasesApi.list(),
  );

  const getStatusIcon = (status: LicensePurchase["payment_status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: LicensePurchase["payment_status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "failed":
        return "destructive";
      default:
        return "warning";
    }
  };

  const downloadReceipt = async (transaction: LicensePurchase) => {
    try {
      const response = await licensePurchasesApi.downloadReceipt(
        transaction.id,
      );
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${transaction.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download receipt:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <CardDescription>
          View your license purchase history and download receipts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Track</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.results.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatDistanceToNow(new Date(transaction.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.track_id}</TableCell>
                  <TableCell>{transaction.license_type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {transaction.amount} {transaction.currency}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      {transaction.payment_provider}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(transaction.payment_status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(transaction.payment_status)}
                        <span className="capitalize">
                          {transaction.payment_status}
                        </span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.payment_status === "completed" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadReceipt(transaction)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
