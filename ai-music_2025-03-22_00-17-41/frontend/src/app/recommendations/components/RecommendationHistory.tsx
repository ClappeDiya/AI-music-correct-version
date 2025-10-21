"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/usetoast";
import { Recommendation } from "@/types/recommendation";

interface RecommendationHistoryItem extends Recommendation {
  interactionType: "view" | "like" | "dislike" | "dismiss" | "refine";
  timestamp: string;
}

export default function RecommendationHistory() {
  const { toast } = useToast();
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/recommendations/history");
        if (!response.ok)
          throw new Error("Failed to fetch recommendation history");
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to load history",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.length > 0 ? (
        history.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{item.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
              <Button variant="outline">View Details</Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Interaction: {item.interactionType}
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center text-muted-foreground">
          No recommendation history found
        </div>
      )}
    </div>
  );
}
