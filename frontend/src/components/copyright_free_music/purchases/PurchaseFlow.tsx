import { useState } from "react";
import { useApiMutation } from "@/lib/hooks/use-api-query";
import { trackPurchasesApi } from "@/lib/api/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import {
  DollarSign,
  CreditCard,
  ShoppingCart,
  FileCheck,
  CheckCircle,
} from "lucide-react";
import type { Track } from "@/lib/api/types";

interface PurchaseFlowProps {
  track: Track;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PAYMENT_METHODS = [
  { id: "credit_card", name: "Credit Card", icon: CreditCard },
  { id: "paypal", name: "PayPal", icon: DollarSign },
];

export function PurchaseFlow({
  track,
  onSuccess,
  onCancel,
}: PurchaseFlowProps) {
  const [step, setStep] = useState<"license" | "payment" | "confirmation">(
    "license",
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");

  const { create: createPurchase } = useApiMutation(
    "purchases",
    trackPurchasesApi,
    {
      onSuccess,
      successMessage: "Track purchased successfully",
    },
  );

  const handlePurchase = async () => {
    await createPurchase.mutate({
      track: track.id,
      payment_method: selectedPaymentMethod,
      amount: track.pricing?.price,
      currency: track.pricing?.currency,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Purchase Track
        </CardTitle>
        <CardDescription>
          Complete your purchase to get access to "{track.title}"
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === "license" && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                License Terms
              </h3>
              <p className="text-sm text-muted-foreground">
                {track.license.description}
              </p>
              <div className="mt-4 space-y-2">
                {Object.entries(track.license.base_conditions || {}).map(
                  ([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>
                        {key.replace("_", " ")}: {String(value)}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <h3 className="font-semibold">Price</h3>
                <p className="text-sm text-muted-foreground">
                  One-time purchase
                </p>
              </div>
              <div className="text-2xl font-bold">
                {track.pricing?.price} {track.pricing?.currency}
              </div>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-4">
            <div>
              <Label>Payment Method</Label>
              <Select
                value={selectedPaymentMethod}
                onValueChange={setSelectedPaymentMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center gap-2">
                        <method.icon className="h-4 w-4" />
                        {method.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="flex justify-between items-center">
                <span>Track Price</span>
                <span>
                  {track.pricing?.price} {track.pricing?.currency}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === "confirmation" && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold">Purchase Complete!</h3>
              <p className="text-muted-foreground">
                You can now download and use the track
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {step !== "confirmation" && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}

        {step === "license" && (
          <Button onClick={() => setStep("payment")}>
            Continue to Payment
          </Button>
        )}

        {step === "payment" && (
          <Button
            onClick={handlePurchase}
            disabled={!selectedPaymentMethod || createPurchase.isLoading}
          >
            {createPurchase.isLoading ? (
              "Processing..."
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Complete Purchase
              </>
            )}
          </Button>
        )}

        {step === "confirmation" && <Button onClick={onSuccess}>Done</Button>}
      </CardFooter>
    </Card>
  );
}
