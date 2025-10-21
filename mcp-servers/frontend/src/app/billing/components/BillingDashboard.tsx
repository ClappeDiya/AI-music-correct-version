"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, CreditCard, DollarSign, Calendar, ArrowUpCircle, Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Progress } from "@/components/ui/Progress";
import { formatCurrency } from "@/lib/utils";
import { PaymentMethodForm } from "./PaymentMethodForm";
import { useToast } from "@/components/ui/useToast";
import { logAuditEvent } from "@/lib/security";

interface BillingSummary {
  current_period_end: string;
  amount_due: number;
  currency: string;
  status: string;
  next_payment_attempt?: string;
  default_payment_method?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

interface AnalyticsSummary {
  total_spent_cents: number;
  payment_success_rate: number;
  active_subscriptions: number;
}

export function BillingDashboard() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBillingSummary();
    fetchAnalytics();
  }, []);

  const fetchBillingSummary = async () => {
    try {
      const response = await fetch("/api/billing/summary");
      if (!response.ok) throw new Error("Failed to fetch billing summary");
      const data = await response.json();
      setSummary(data);

      // Track dashboard view
      await logAuditEvent("billing_dashboard_view", "user", {
        has_payment_method: !!data.default_payment_method,
        has_due_payment: data.amount_due > 0,
      });
    } catch (error) {
      console.error("Error fetching billing summary:", error);
      toast({
        title: "Error",
        description: "Failed to load billing summary. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/billing/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleAddPaymentMethod = () => {
    setShowPaymentForm(true);
    logAuditEvent("payment_method_add_initiated", "user", {});
  };

  const handlePaymentMethodAdded = () => {
    setShowPaymentForm(false);
    fetchBillingSummary();
    toast({
      title: "Success",
      description: "Payment method added successfully",
    });
    logAuditEvent("payment_method_added", "user", {});
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading billing information...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summary?.status === "past_due" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Required</AlertTitle>
          <AlertDescription>
            Your payment is past due. Please update your payment method or pay
            the outstanding balance to avoid service interruption.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary
                ? formatCurrency(summary.amount_due / 100, summary.currency)
                : "-"}
            </div>
            {summary?.next_payment_attempt && (
              <p className="text-xs text-muted-foreground">
                Next attempt:{" "}
                {new Date(summary.next_payment_attempt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Payment Method
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summary?.default_payment_method ? (
              <div>
                <div className="text-2xl font-bold">
                  •••• {summary.default_payment_method.last4}
                </div>
                <p className="text-xs text-muted-foreground">
                  Expires {summary.default_payment_method.exp_month}/
                  {summary.default_payment_method.exp_year}
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-2">No payment method on file</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddPaymentMethod}
                >
                  Add Payment Method
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Billing Period
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary
                ? new Date(summary.current_period_end).toLocaleDateString()
                : "-"}
            </div>
            <p className="text-xs text-muted-foreground">Next billing date</p>
          </CardContent>
        </Card>
      </div>

      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Analytics</CardTitle>
            <CardDescription>
              Your payment history and statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium">Payment Success Rate</div>
                <div className="text-sm text-muted-foreground">
                  {Math.round(analytics.payment_success_rate * 100)}%
                </div>
              </div>
              <Progress
                value={analytics.payment_success_rate * 100}
                className="h-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Spent</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.total_spent_cents / 100, "USD")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Active Subscriptions</p>
                <p className="text-2xl font-bold">
                  {analytics.active_subscriptions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showPaymentForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Payment Method</CardTitle>
            <CardDescription>
              Enter your card details to set up automatic payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentMethodForm
              onSuccess={handlePaymentMethodAdded}
              onCancel={() => setShowPaymentForm(false)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
