'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/componen../ui/card"
import { useQuery } from "@tanstack/react-query"
import { getTrackAnalyticsAggregates } from "@/lib/api/analytics"
import type { AggregateData, GenrePreferences, TrendAnalysis } from "@/types/analytics"
import { Skeleton } from "@/components/ui/Skeleton"
import { LucideHeadphones, LucideMusic, LucideTrendingUp } from "lucide-react"
import { TopCollaborators } from "./TopCollaborators"

export function UserAnalyticsDashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: getTrackAnalyticsAggregates,
    staleTime: 60 * 1000, // 60 seconds
    refetchOnWindowFocus: true
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px]">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-medium">Failed to load analytics</h3>
          <p className="text-sm mt-2">{error?.message || 'Unknown error occurred'}</p>
        </div>
      </div>
    )
  }
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="col-span-2">
        <TopCollaborators />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total Listening Time
          </CardTitle>
          <LucideHeadphones className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.totalHours || 0}h
          </div>
          <p className="text-xs text-muted-foreground">
            Last 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Top Genre
          </CardTitle>
          <LucideMusic className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.genrePreferences?.topGenre || 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {data?.genrePreferences?.topGenrePercentage || 0}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Trend Analysis
          </CardTitle>
          <LucideTrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.trendAnalysis?.trend || 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {data?.trendAnalysis?.changePercentage || 0}% change
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

