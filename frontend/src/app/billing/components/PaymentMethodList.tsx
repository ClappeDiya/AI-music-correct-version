"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreditCard, Trash2, Star, StarOff } from "lucide-react";
import { useToast } from "@/components/ui/useToast";
import { logAuditEvent } from "@/lib/security";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export function PaymentMethodList() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/billing/payment-methods");
      if (!response.ok) throw new Error("Failed to fetch payment methods");
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/billing/payment-methods/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete payment method");
      }

      await logAuditEvent("payment_method_deleted", "user", {
        payment_method_id: id,
      });

      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));

      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(
        `/api/billing/payment-methods/${id}/default`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to set default payment method");
      }

      await logAuditEvent("payment_method_set_default", "user", {
        payment_method_id: id,
      });

      setPaymentMethods((prev) =>
        prev.map((pm) => ({
          ...pm,
          is_default: pm.id === id,
        })),
      );

      toast({
        title: "Success",
        description: "Default payment method updated",
      });
    } catch (error) {
      console.error("Error setting default payment method:", error);
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading payment methods...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Payment Methods</CardTitle>
          <CardDescription>
            You haven't added any payment methods yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {paymentMethods.map((method) => (
        <Card key={method.id}>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <CreditCard className="h-6 w-6" />
              <div>
                <p className="font-medium">
                  {method.brand} •••• {method.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires {method.exp_month}/{method.exp_year}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSetDefault(method.id)}
                disabled={method.is_default}
              >
                {method.is_default ? (
                  <Star className="h-4 w-4 text-yellow-400" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(method.id)}
                disabled={method.is_default}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
