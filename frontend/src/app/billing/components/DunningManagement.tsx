"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/useToast";
import { DunningStatus } from "@/lib/dunning";
import { formatDate } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

interface DunningManagementProps {
  planId: string;
  onStatusChange?: (status: DunningStatus) => void;
}

export function DunningManagement({
  planId,
  onStatusChange,
}: DunningManagementProps) {
  const [loading, setLoading] = useState(true);
  const [dunningStatus, setDunningStatus] = useState<DunningStatus | null>(
    null,
  );
  const { toast } = useToast();

  useEffect(() => {
    fetchDunningStatus();
  }, [planId]);

  const fetchDunningStatus = async () => {
    try {
      const response = await fetch(`/api/billing/dunning/status/${planId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch dunning status");
      }
      const data = await response.json();
      setDunningStatus(data);
      onStatusChange?.(data);
    } catch (error) {
      console.error("Error fetching dunning status:", error);
      toast({
        title: "Error",
        description: "Failed to load dunning status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryNow = async () => {
    if (!dunningStatus) return;

    try {
      setLoading(true);
      const response = await fetch("/api/billing/dunning/retry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_id: planId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to retry payment");
      }

      const updatedStatus = await response.json();
      setDunningStatus(updatedStatus);
      onStatusChange?.(updatedStatus);

      toast({
        title:
          updatedStatus.status === "resolved" ? "Success" : "Payment Failed",
        description:
          updatedStatus.status === "resolved"
            ? "Payment processed successfully"
            : "Payment retry failed. We'll try again later.",
      });
    } catch (error) {
      console.error("Error retrying payment:", error);
      toast({
        title: "Error",
        description: "Failed to process payment retry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dunningStatus) {
    return null;
  }

  const getStatusIcon = () => {
    switch (dunningStatus.status) {
      case "resolved":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "failed":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (dunningStatus.status) {
      case "resolved":
        return "Payment Recovered";
      case "failed":
        return "Recovery Failed";
      default:
        return "Payment Recovery in Progress";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusText()}
        </CardTitle>
        <CardDescription>
          {dunningStatus.status === "active" &&
            `Next attempt scheduled for ${formatDate(dunningStatus.nextAttemptDate!)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Recovery Attempts</p>
              <div className="space-y-2">
                {dunningStatus.attempts.map((attempt, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>Attempt {attempt.attemptNumber}</span>
                    <span className="text-muted-foreground">
                      {formatDate(attempt.nextAttemptDate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {dunningStatus.status === "active" && (
            <Button
              onClick={handleRetryNow}
              disabled={loading}
              className="w-full"
            >
              Retry Payment Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
