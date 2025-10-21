"use client";

import {
  TrendingUp,
  Users,
  Music2,
  Radio,
  BarChart3,
  Activity,
  Globe,
  Clock,
  Loader2,
  GripVertical,
  Settings,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MetricChart } from "../charts/metric-chart";
import { kpiApi } from "@/lib/api/kpi";
import { PermissionGuard } from "../auth/permission-guard";

interface KPIWidgetProps {
  type: string;
  title: string;
  config: Record<string, any>;
}

const widgetTypes = {
  user_growth: {
    icon: TrendingUp,
    title: "User Growth",
    description: "Track user acquisition and retention",
    permission: "generateReport",
  },
  active_users: {
    icon: Users,
    title: "Active Users",
    description: "Monitor daily and monthly active users",
    permission: "accessUsers",
  },
  top_genres: {
    icon: Music2,
    title: "Top Genres",
    description: "Most popular music genres",
    permission: "accessGenres",
  },
  trending_styles: {
    icon: Radio,
    title: "Trending Styles",
    description: "Currently trending music styles",
    permission: "accessStyles",
  },
  revenue_metrics: {
    icon: BarChart3,
    title: "Revenue Metrics",
    description: "Track revenue and financial KPIs",
    permission: "accessRevenue",
  },
  engagement: {
    icon: Activity,
    title: "User Engagement",
    description: "Measure user interaction and activity",
    permission: "accessEngagement",
  },
  geographic: {
    icon: Globe,
    title: "Geographic Distribution",
    description: "User distribution by region",
    permission: "accessGeographic",
  },
  usage_time: {
    icon: Clock,
    title: "Usage Time",
    description: "Average time spent on platform",
    permission: "accessUsageTime",
  },
} as const;

export function KPIWidget({ type, title, config }: KPIWidgetProps) {
  // Fetch KPI data
  const { data, isLoading } = useQuery({
    queryKey: ["kpi", type, config],
    queryFn: () => kpiApi.getData(type, config),
  });

  const WidgetIcon =
    widgetTypes[type as keyof typeof widgetTypes]?.icon || Activity;

  return (
    <PermissionGuard
      permission={widgetTypes[type]?.permission || "generateReport"}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <WidgetIcon className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <GripVertical className="h-4 w-4 cursor-move text-muted-foreground" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Widget Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Edit Configuration</DropdownMenuItem>
                <DropdownMenuItem>Change Time Range</DropdownMenuItem>
                <DropdownMenuItem>Refresh Data</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Remove Widget
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">
                  {formatValue(data.currentValue)}
                </div>
                {data.change && (
                  <div
                    className={cn(
                      "text-sm",
                      data.change > 0 ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {formatChange(data.change)}
                  </div>
                )}
              </div>
              {data.trend && (
                <div className="h-32">
                  <MetricChart
                    title=""
                    data={data.trend}
                    type="line"
                    onTypeChange={() => {}}
                    xKey="date"
                    yKey="value"
                    height={128}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </PermissionGuard>
  );
}

function formatValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

function formatChange(change: number): string {
  const prefix = change > 0 ? "+" : "";
  return `${prefix}${change.toFixed(1)}%`;
}
