"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Users,
  Music2,
  DollarSign,
  Shield,
  AlertTriangle,
  Flag,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MetricChart } from "../charts/metric-chart";
import { adminApi } from "@/lib/api/admin";
import { PermissionGuard } from "../auth/permission-guard";

const timeRanges = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "Last Year" },
];

export function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: metrics } = useQuery({
    queryKey: ["admin-metrics", timeRange],
    queryFn: () => adminApi.getAggregatedMetrics(timeRange),
  });

  const { data: contentMetrics } = useQuery({
    queryKey: ["content-metrics", timeRange],
    queryFn: () => adminApi.getContentMetrics(timeRange),
  });

  const { data: revenueMetrics } = useQuery({
    queryKey: ["revenue-metrics", timeRange],
    queryFn: () => adminApi.getRevenueMetrics(timeRange),
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Platform-wide analytics and insights
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PermissionGuard permission="accessUsers">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.totalUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.userGrowth > 0 ? "+" : ""}
                    {metrics?.userGrowth}% from last period
                  </p>
                  <MetricChart
                    title=""
                    data={metrics?.userTrend || []}
                    type="line"
                    onTypeChange={() => {}}
                    xKey="date"
                    yKey="value"
                    height={100}
                  />
                </CardContent>
              </Card>
            </PermissionGuard>

            <PermissionGuard permission="accessRevenue">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Revenue (Aggregated)
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${metrics?.totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.revenueGrowth > 0 ? "+" : ""}
                    {metrics?.revenueGrowth}% from last period
                  </p>
                  <MetricChart
                    title=""
                    data={metrics?.revenueTrend || []}
                    type="line"
                    onTypeChange={() => {}}
                    xKey="date"
                    yKey="value"
                    height={100}
                  />
                </CardContent>
              </Card>
            </PermissionGuard>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Content Growth
                </CardTitle>
                <Music2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.totalContent.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.contentGrowth > 0 ? "+" : ""}
                  {metrics?.contentGrowth}% from last period
                </p>
                <MetricChart
                  title=""
                  data={metrics?.contentTrend || []}
                  type="line"
                  onTypeChange={() => {}}
                  xKey="date"
                  yKey="value"
                  height={100}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Platform Health
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.platformHealth}%
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>System Uptime</span>
                    <span>{metrics?.uptime}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>API Performance</span>
                    <span>{metrics?.apiPerformance}ms</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Error Rate</span>
                    <span>{metrics?.errorRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Content Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart
                  title=""
                  data={contentMetrics?.categoryDistribution || []}
                  type="bar"
                  onTypeChange={() => {}}
                  xKey="category"
                  yKey="count"
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Growth by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart
                  title=""
                  data={contentMetrics?.growthByType || []}
                  type="line"
                  onTypeChange={() => {}}
                  xKey="date"
                  yKey="value"
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <PermissionGuard permission="accessRevenue">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricChart
                    title=""
                    data={revenueMetrics?.bySource || []}
                    type="pie"
                    onTypeChange={() => {}}
                    xKey="source"
                    yKey="amount"
                    height={300}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricChart
                    title=""
                    data={revenueMetrics?.trends || []}
                    type="line"
                    onTypeChange={() => {}}
                    xKey="date"
                    yKey="amount"
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>
          </PermissionGuard>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Reviews
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.pendingReviews}
                </div>
                <div className="mt-4">
                  <Button size="sm" className="w-full">
                    Review Content
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Reported Content
                </CardTitle>
                <Flag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.reportedContent}
                </div>
                <div className="mt-4">
                  <Button size="sm" className="w-full">
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Content Health
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.contentHealth}%
                </div>
                <MetricChart
                  title=""
                  data={metrics?.healthTrend || []}
                  type="line"
                  onTypeChange={() => {}}
                  xKey="date"
                  yKey="value"
                  height={100}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
