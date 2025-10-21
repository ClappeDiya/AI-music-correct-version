"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { UserProgress } from "@/types/progress";

interface UserProgressCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  progress?: number;
  subtitle?: string;
  className?: string;
}

export function UserProgressCard({
  title,
  value,
  icon: Icon,
  iconColor,
  progress,
  subtitle,
  className,
}: UserProgressCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{title}</span>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
          <div className="text-2xl font-bold">{value}</div>
          {progress !== undefined && (
            <Progress value={progress} className="h-2" />
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function useUserProgressCard(userId: string) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/progress`);
        if (!response.ok) {
          throw new Error("Failed to fetch user progress");
        }
        const data = await response.json();
        setProgress(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProgress();
    }
  }, [userId]);

  return { progress, loading, error };
}
