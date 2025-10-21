"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useToast } from "@/components/ui/useToast";
import { logAuditEvent } from "@/lib/security";
import { formatCurrency } from "@/lib/utils";
import { CalendarDays, DollarSign } from "lucide-react";

interface InstallmentPlan {
  id: string;
  total_amount_cents: number;
  remaining_amount_cents: number;
  installment_count: number;
  frequency: "weekly" | "monthly" | "custom";
  next_payment_date: string;
  status: "active" | "completed" | "defaulted";
}

interface InstallmentPlanFormProps {
  invoiceId: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InstallmentPlanForm({
  invoiceId,
  amount,
  currency,
  onSuccess,
  onCancel,
}: InstallmentPlanFormProps) {
  const [loading, setLoading] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(3);
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("monthly");
  const { toast } = useToast();

  const installmentAmount = Math.ceil(amount / installmentCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Log the attempt
      await logAuditEvent("installment_plan_creation_started", "user", {
        invoice_id: invoiceId,
        installment_count: installmentCount,
        frequency,
      });

      const response = await fetch("/api/billing/installment-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
          total_amount_cents: amount,
          installment_count: installmentCount,
          frequency,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create installment plan");
      }

      const plan: InstallmentPlan = await response.json();

      // Log success
      await logAuditEvent("installment_plan_created", "user", {
        plan_id: plan.id,
        invoice_id: invoiceId,
      });

      toast({
        title: "Success",
        description: "Installment plan created successfully",
      });

      onSuccess();
    } catch (error) {
      console.error("Error creating installment plan:", error);

      // Log failure
      await logAuditEvent("installment_plan_creation_failed", "user", {
        invoice_id: invoiceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      toast({
        title: "Error",
        description: "Failed to create installment plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create Installment Plan</CardTitle>
          <CardDescription>
            Split your payment into multiple installments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(amount / 100, currency)}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Number of Installments
            </label>
            <Select
              value={String(installmentCount)}
              onValueChange={(value) => setInstallmentCount(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of installments" />
              </SelectTrigger>
              <SelectContent>
                {[3, 6, 12].map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    {count} payments of{" "}
                    {formatCurrency(Math.ceil(amount / count) / 100, currency)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Frequency</label>
            <Select
              value={frequency}
              onValueChange={(value: "weekly" | "monthly") =>
                setFrequency(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Each Installment</p>
                <p className="text-xl font-bold">
                  {formatCurrency(installmentAmount / 100, currency)}
                </p>
              </div>
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Create Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
