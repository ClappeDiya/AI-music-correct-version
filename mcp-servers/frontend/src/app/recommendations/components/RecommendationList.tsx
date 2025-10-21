"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/componen../ui/card";
import RecommendationItem from "./RecommendationItem";
import { Skeleton } from "@/components/ui/Skeleton";

interface Recommendation {
  user_id: number;
  score: number;
}

export default function RecommendationList() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/recommendations/suggestions/");
        const data = await response.json();
        setRecommendations(data.suggestions);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <RecommendationItem key={rec.user_id} recommendation={rec} />
          ))
        ) : (
          <p className="text-muted-foreground">No recommendations available</p>
        )}
      </CardContent>
    </Card>
  );
}
