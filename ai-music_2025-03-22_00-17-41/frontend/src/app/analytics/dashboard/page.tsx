"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MixingAnalyticsView } from "@/components/analytics/mixing/MixingAnalyticsView";
import { GenreMixingView } from "@/components/analytics/genre/GenreMixingView";
import { PersonaFusionView } from "@/components/analytics/persona/PersonaFusionView";
import { DateRangePicker } from "@/components/ui/daterangepicker";

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date(),
  ]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <Tabs defaultValue="mixing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mixing">Mixing Analytics</TabsTrigger>
          <TabsTrigger value="genres">Genre Analysis</TabsTrigger>
          <TabsTrigger value="persona">Persona Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="mixing">
          <MixingAnalyticsView />
        </TabsContent>

        <TabsContent value="genres">
          <GenreMixingView sessionId="current" />
        </TabsContent>

        <TabsContent value="persona">
          <PersonaFusionView userId="current" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
