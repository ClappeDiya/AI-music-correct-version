"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/useToast";
import { logAuditEvent } from "@/lib/security"; 
import { RefreshCw } from "lucide-react";

export interface PaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentMethodForm({
  onSuccess,
  onCancel,
}: PaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setLoading(true);

      // Log the attempt
      await logAuditEvent("payment_method_setup_started", "user", {});

      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/billing/payment-methods`,
        },
      });

      if (error) {
        throw error;
      }

      // Log success
      await logAuditEvent("payment_method_setup_completed", "user", {});

      toast({
        title: "Success",
        description: "Your payment method has been added successfully.",
      });

      onSuccess();
    } catch (error) {
      console.error("Error setting up payment method:", error);

      // Log failure
      await logAuditEvent("payment_method_setup_failed", "user", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to set up payment method",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || loading}>
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            "Add Payment Method"
          )}
        </Button>
      </div>
    </form>
  );
}
