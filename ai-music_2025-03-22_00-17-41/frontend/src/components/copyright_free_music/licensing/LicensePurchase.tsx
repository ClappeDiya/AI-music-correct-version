import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import { Track, LicenseTermDetails, LicensePurchase } from "@/lib/api/types";
import { licenseTermsApi, licensePurchasesApi } from "@/lib/api/services";
import { loadStripe } from "@stripe/stripe-js";
import { PayPalButtons } from "@paypal/react-paypal-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/useToast";
import {
  DollarSign,
  CreditCard,
  Check,
  AlertCircle,
  Globe,
  Clock,
  Users,
  Pencil,
  FileCheck,
} from "lucide-react";

interface LicensePurchaseProps {
  track: Track;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete?: (purchase: LicensePurchase) => void;
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

export function LicensePurchase({
  track,
  open,
  onOpenChange,
  onPurchaseComplete,
}: LicensePurchaseProps) {
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">(
    "stripe",
  );
  const { toast } = useToast();

  const { data: licenseTerms } = useApiQuery(["license-terms", track.id], () =>
    licenseTermsApi.list({ params: { track_id: track.id } }),
  );

  const { create: createPurchase } = useApiMutation(
    "license-purchases",
    licensePurchasesApi,
  );

  const handleStripePayment = async (licenseId: string) => {
    const license = licenseTerms?.results.find((lt) => lt.id === licenseId);
    if (!license) return;

    try {
      // Create a payment intent on your backend
      const { clientSecret } = await licensePurchasesApi.createPaymentIntent({
        track_id: track.id,
        license_id: licenseId,
        payment_provider: "stripe",
      });

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      // Confirm the payment with Stripe
      const { paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            // Stripe Elements would be integrated here
          },
          billing_details: {
            // User billing details would be collected here
          },
        },
      });

      if (paymentIntent.status === "succeeded") {
        const purchase = await createPurchase.mutateAsync({
          track_id: track.id,
          license_type: license.id,
          payment_provider: "stripe",
          payment_id: paymentIntent.id,
          amount: license.price,
          currency: license.currency,
        });

        onPurchaseComplete?.(purchase);
        toast({
          title: "Purchase Successful",
          description: "Your license has been activated.",
          icon: <Check className="h-4 w-4 text-green-500" />,
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description:
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />,
      });
    }
  };

  const handlePayPalPayment = async (licenseId: string) => {
    const license = licenseTerms?.results.find((lt) => lt.id === licenseId);
    if (!license) return;

    // PayPal integration would be implemented here
  };

  const handlePurchase = async () => {
    if (!selectedLicense) return;

    if (paymentMethod === "stripe") {
      await handleStripePayment(selectedLicense);
    } else {
      await handlePayPalPayment(selectedLicense);
    }
  };

  const renderLicenseCard = (license: LicenseTermDetails) => (
    <Card
      key={license.id}
      className={`relative cursor-pointer transition-all ${
        selectedLicense === license.id ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => setSelectedLicense(license.id)}
    >
      {selectedLicense === license.id && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-primary">Selected</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{license.name}</span>
          <span className="text-xl font-bold">
            {license.currency === "USD" ? "$" : "€"}
            {license.price}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{license.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Territory: {license.usage_rights.territory.join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Duration: {license.usage_rights.duration}
            </span>
          </div>
          {license.usage_rights.distribution_limit && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Distribution Limit:{" "}
                {license.usage_rights.distribution_limit.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Modifications:{" "}
              {license.usage_rights.modifications_allowed
                ? "Allowed"
                : "Not Allowed"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Attribution:{" "}
              {license.usage_rights.attribution_required
                ? "Required"
                : "Not Required"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Purchase License</DialogTitle>
          <DialogDescription>
            Select a license type and payment method for "{track.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid gap-4 md:grid-cols-2">
              {licenseTerms?.results.map(renderLicenseCard)}
            </div>
          </ScrollArea>

          {selectedLicense && (
            <>
              <Tabs
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as "stripe" | "paypal")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="stripe">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Credit Card
                  </TabsTrigger>
                  <TabsTrigger value="paypal">
                    <DollarSign className="h-4 w-4 mr-2" />
                    PayPal
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="stripe">
                  {/* Stripe Elements would be integrated here */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground">
                        Stripe payment form will be integrated here
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="paypal">
                  <Card>
                    <CardContent className="pt-6">
                      <PayPalButtons
                        style={{ layout: "horizontal" }}
                        createOrder={(data, actions) => {
                          // PayPal order creation logic
                          return Promise.resolve("dummy-order-id");
                        }}
                        onApprove={(data, actions) => {
                          // PayPal payment approval logic
                          return Promise.resolve();
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePurchase} disabled={!selectedLicense}>
                  Complete Purchase
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
