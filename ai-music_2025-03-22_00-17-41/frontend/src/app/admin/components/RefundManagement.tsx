"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Dialog } from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { RefreshCw, CreditCard, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Refund {
  id: string;
  stripe_refund_id: string;
  charge_id: string;
  amount_cents: number;
  reason: string;
  refund_data: {
    status: string;
    receipt_url?: string;
    [key: string]: any;
  };
  created_at: string;
}

export function RefundManagement() {
  const [selectedCharge, setSelectedCharge] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentRefunds, setRecentRefunds] = useState<Refund[]>([]);

  const handleRefund = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          charge_id: selectedCharge,
          amount_cents: Math.round(parseFloat(amount) * 100),
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process refund");
      }

      const data = await response.json();
      setRecentRefunds((prev) => [data, ...prev]);

      // Reset form
      setSelectedCharge("");
      setAmount("");
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process refund");
      console.error("Error processing refund:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Process Refund</CardTitle>
          <CardDescription>
            Issue refunds or apply credits to customer accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Charge</label>
            <Select value={selectedCharge} onValueChange={setSelectedCharge}>
              <SelectTrigger>
                <SelectValue placeholder="Select charge to refund" />
              </SelectTrigger>
              <SelectContent>
                {/* TODO: Fetch and populate charges */}
                <SelectItem value="example">Example Charge ($100)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">$</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAmount(e.target.value)
                }
                className="pl-7"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              placeholder="Enter reason for refund"
              value={reason}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setReason(e.target.value)
              }
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <Button
            onClick={handleRefund}
            disabled={loading || !selectedCharge || !amount || !reason}
            className="w-full"
          >
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Process Refund
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Refunds</CardTitle>
          <CardDescription>
            View recently processed refunds and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRefunds.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No recent refunds
              </p>
            ) : (
              recentRefunds.map((refund) => (
                <div
                  key={refund.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {formatCurrency(refund.amount_cents / 100, "USD")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {refund.reason}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(refund.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        refund.refund_data.status === "succeeded"
                          ? "text-green-500"
                          : "text-yellow-500"
                      }`}
                    >
                      {refund.refund_data.status}
                    </span>
                    {refund.refund_data.receipt_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(refund.refund_data.receipt_url, "_blank")
                        }
                      >
                        View Receipt
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
