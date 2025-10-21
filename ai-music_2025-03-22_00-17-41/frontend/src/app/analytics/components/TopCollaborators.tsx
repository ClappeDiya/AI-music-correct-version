"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/componen../ui/card";
import { useQuery } from "@tanstack/react-query";
import { getCollaborators } from "@/lib/api/analytics";
import { Skeleton } from "@/components/ui/Skeleton";
import { LucideUsers } from "lucide-react";

export function TopCollaborators() {
  const { data, isLoading } = useQuery({
    queryKey: ["top-collaborators"],
    queryFn: getCollaborators,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Top Collaborators</CardTitle>
        <LucideUsers className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data?.map((collaborator, index) => (
            <div key={collaborator.id} className="flex justify-between">
              <span className="text-sm">
                {index + 1}. {collaborator.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {collaborator.interactions} interactions
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
