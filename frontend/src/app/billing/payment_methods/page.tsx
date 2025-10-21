"use client";

import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentMethodForm } from "../components/PaymentMethodForm";
import { PaymentMethodList } from "../components/PaymentMethodList";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/usetoast";
import { logAuditEvent } from "@/lib/security";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function PaymentMethodsPage() {
  const [showForm, setShowForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");
  const { toast } = useToast();

  const handleAddPaymentMethod = async () => {
    try {
      const response = await fetch("/api/billing/payment-methods/setup", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to initialize payment method setup");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setShowForm(true);

      await logAuditEvent("payment_method_setup_initiated", "user", {});
    } catch (error) {
      console.error("Error initializing payment setup:", error);
      toast({
        title: "Error",
        description: "Failed to initialize payment setup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentMethodAdded = () => {
    setShowForm(false);
    setClientSecret("");
    toast({
      title: "Success",
      description: "Payment method added successfully",
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setClientSecret("");
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Payment Methods</h2>
        {!showForm && (
          <Button onClick={handleAddPaymentMethod}>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        )}
      </div>

      {showForm && clientSecret ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                },
              }}
            >
              <PaymentMethodForm
                onSuccess={handlePaymentMethodAdded}
                onCancel={handleCancel}
              />
            </Elements>
          </CardContent>
        </Card>
      ) : (
        <PaymentMethodList />
      )}
    </div>
  );
}
