"use client";

import { useGenreMixingSession } from "@/services/genre-mixing.service";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";

interface GenreMixingViewProps {
  sessionId: string;
}

export function GenreMixingView({ sessionId }: GenreMixingViewProps) {
  const { data, isLoading } = useGenreMixingSession(sessionId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Genre Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium">Harmony</h3>
              <p className="text-2xl font-bold">
                {data?.analysisResults.harmony.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Rhythm</h3>
              <p className="text-2xl font-bold">
                {data?.analysisResults.rhythm.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Melody</h3>
              <p className="text-2xl font-bold">
                {data?.analysisResults.melody.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnalyticsChart
        type="bar"
        title="Genre Distribution"
        data={data?.genres || []}
        xAxis="id"
        yAxis="weight"
      />
    </div>
  );
}
