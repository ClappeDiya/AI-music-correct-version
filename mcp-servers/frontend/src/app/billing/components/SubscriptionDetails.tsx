"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface SubscriptionPlan {
  name: string;
  price: number;
  features: string[];
}

interface Subscription {
  id: string;
  stripe_subscription_id: string;
  plan: SubscriptionPlan;
  status: string;
  start_date: string;
  end_date: string;
  configuration: {
    stripe_data: any;
  };
}

export function SubscriptionDetails() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/billing/subscriptions/current");
        if (!response.ok) {
          throw new Error("Failed to fetch subscription");
        }
        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load subscription",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Loading subscription details...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Manage your subscription plan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground">
                {subscription?.plan.name || "Free Plan"}
              </p>
            </div>
            <Button variant="outline">Change Plan</Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Status</p>
              <Badge
                variant={
                  subscription?.status === "active" ? "default" : "destructive"
                }
              >
                {subscription?.status || "Inactive"}
              </Badge>
            </div>
          </div>

          {subscription?.end_date && (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Renewal Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(subscription.end_date), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
          )}

          {subscription?.plan.features && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Plan Features</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                {subscription.plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
