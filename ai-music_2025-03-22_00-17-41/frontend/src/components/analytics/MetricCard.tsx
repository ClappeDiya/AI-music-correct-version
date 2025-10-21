"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  isLoading?: boolean;
  format?: (value: number) => string;
}

export function MetricCard({
  title,
  value,
  change,
  isLoading,
  format = (v) => v.toString(),
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-[150px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[100px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold">{format(value)}</p>
          {change && (
            <div
              className={`flex items-center ${change >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="ml-1">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
