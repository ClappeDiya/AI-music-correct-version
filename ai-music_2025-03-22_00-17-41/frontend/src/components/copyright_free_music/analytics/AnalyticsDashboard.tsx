import { useApiQuery } from "@/lib/hooks/use-api-query";
import { trackAnalyticsApi } from "@/lib/api/services";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  BarChart as BarChartIcon,
  TrendingUp,
  Users,
  Globe,
  Download,
  DollarSign,
  FileDown,
  Calendar,
  Filter,
  Share2,
  Heart,
  MessageSquare,
  Music2,
  Radio,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  Activity,
  Award,
  BarChart2,
  PieChart,
} from "lucide-react";
import { DataTableView } from "../data-table/data-table-view";
import { Button } from "@/components/ui/Button";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  BarChart,
  LineChart,
  PieChart as PieChartComponent,
  DonutChart,
  HeatMap,
} from "@/components/ui/charts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { useEffect, useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { useWebSocket } from "@/lib/hooks/use-websocket";

const columns = [
  {
    accessorKey: "track.title",
    header: "Track",
  },
  {
    accessorKey: "analytics_data.plays",
    header: "Total Plays",
  },
  {
    accessorKey: "analytics_data.unique_listeners",
    header: "Unique Listeners",
  },
  {
    accessorKey: "analytics_data.downloads",
    header: "Downloads",
  },
  {
    accessorKey: "analytics_data.revenue",
    header: "Revenue",
    cell: ({ row }) => `$${row.original.analytics_data.revenue.toFixed(2)}`,
  },
  {
    accessorKey: "last_updated",
    header: "Last Updated",
    cell: ({ row }) =>
      format(new Date(row.original.last_updated), "MMM d, yyyy"),
  },
];

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: number;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p
            className={`text-xs ${trend > 0 ? "text-green-500" : "text-red-500"} flex items-center gap-1`}
          >
            <TrendingUp className="h-3 w-3" />
            {trend > 0 ? "+" : ""}
            {trend}% from last period
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [timeframe, setTimeframe] = useState("month");
  const [realTimeData, setRealTimeData] = useState<RealTimeAnalytics | null>(
    null,
  );

  const socket = useWebSocket("ws://your-backend/ws/analytics/");

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setRealTimeData(data);
      };
    }
  }, [socket]);

  const { data, isLoading } = useApiQuery(
    ["analytics", dateRange, timeframe],
    () =>
      trackAnalyticsApi.getAnalytics({
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
        timeframe,
      }),
  );

  const handleExport = async (
    format: "csv" | "pdf" | "excel" | "json" | "xml",
  ) => {
    const response = await trackAnalyticsApi.exportAnalytics({
      format,
      dateRange: {
        start: dateRange.from.toISOString(),
        end: dateRange.to.toISOString(),
      },
      metrics: [
        "plays",
        "downloads",
        "revenue",
        "engagement",
        "conversion",
        "social",
      ],
      groupBy: timeframe as "hour" | "day" | "week" | "month",
      includeComparative: true,
      customization: {
        charts: true,
        branding: true,
        executive_summary: true,
      },
    });

    const blob = new Blob([response.data], {
      type:
        format === "csv"
          ? "text/csv"
          : format === "pdf"
            ? "application/pdf"
            : format === "excel"
              ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              : format === "json"
                ? "application/json"
                : "application/xml",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-export.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h2>
        <div className="flex items-center gap-4">
          <DatePickerWithRange value={dateRange} onChange={setDateRange} />
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xml")}>
                Export as XML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {realTimeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-time Activity
            </CardTitle>
            <CardDescription>
              Live tracking of current listener activity and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Listeners</span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">
                  {realTimeData.concurrent_listeners}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Sessions</span>
                  <Radio className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">
                  {realTimeData.active_sessions}
                </div>
              </div>

              <div className="col-span-2">
                <h4 className="text-sm font-medium mb-2">Live Events</h4>
                <div className="space-y-2">
                  {realTimeData.live_events.slice(0, 3).map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      {event.type === "play" && <Play className="h-4 w-4" />}
                      {event.type === "download" && (
                        <Download className="h-4 w-4" />
                      )}
                      {event.type === "license" && (
                        <DollarSign className="h-4 w-4" />
                      )}
                      {event.type === "share" && <Share2 className="h-4 w-4" />}
                      <span>
                        {format(parseISO(event.timestamp), "HH:mm:ss")}
                      </span>
                      <span className="truncate">{event.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Plays"
          value={data?.metrics.total_plays.toLocaleString()}
          icon={BarChartIcon}
          trend={12}
          description="Total track plays across all platforms"
        />
        <MetricCard
          title="Unique Listeners"
          value={data?.metrics.unique_listeners.toLocaleString()}
          icon={Users}
          trend={8}
          description="Individual users who played your tracks"
        />
        <MetricCard
          title="Downloads"
          value={data?.metrics.total_downloads.toLocaleString()}
          icon={Download}
          trend={-3}
          description="Total track downloads"
        />
        <MetricCard
          title="Revenue"
          value={`$${data?.metrics.total_revenue.toLocaleString()}`}
          icon={DollarSign}
          trend={15}
          description="Total revenue from all sources"
        />
        <MetricCard
          title="Active Markets"
          value={data?.metrics.active_markets}
          icon={Globe}
          description="Countries with active listeners"
        />
        <MetricCard
          title="Growth Rate"
          value={`${data?.metrics.growth_rate}%`}
          icon={TrendingUp}
          trend={5}
          description="Month-over-month growth in plays"
        />
        <MetricCard
          title="Engagement Score"
          value={`${(data?.metrics.engagement_metrics.average_session_duration || 0).toFixed(1)}%`}
          icon={Activity}
          trend={5}
          description="Overall user engagement rating"
        />
        <MetricCard
          title="Social Impact"
          value={data?.metrics.social_metrics.shares || 0}
          icon={Share2}
          trend={12}
          description="Total shares and playlist additions"
        />
        <MetricCard
          title="Genre Ranking"
          value={`#${data?.metrics.comparative_metrics.genre_rank || 0}`}
          icon={Award}
          description={`Top ${data?.metrics.comparative_metrics.percentile}% in genre`}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="devices">Devices & Platforms</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="social">Social Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Track Analytics</CardTitle>
              <CardDescription>
                Detailed performance metrics for all your tracks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTableView
                columns={columns}
                data={data?.tracks || []}
                isLoading={isLoading}
                searchPlaceholder="Search tracks..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
              <CardDescription>
                Track plays and downloads over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={data?.engagement_trends || []}
                categories={["plays", "downloads"]}
                index="date"
                colors={["blue", "green"]}
                valueFormatter={(value) => value.toLocaleString()}
                className="h-[400px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Peak Listening Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <HeatMap
                  data={
                    data?.metrics.engagement_metrics.peak_listening_hours.map(
                      (h) => ({
                        hour: h.hour,
                        value: h.count,
                      }),
                    ) || []
                  }
                  index="hour"
                  categories={["value"]}
                  colors={["blue"]}
                  className="h-[200px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Skip Rate</span>
                    <span>{data?.metrics.engagement_metrics.skip_rate}%</span>
                  </div>
                  <Progress
                    value={data?.metrics.engagement_metrics.skip_rate || 0}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Replay Rate</span>
                    <span>{data?.metrics.engagement_metrics.replay_rate}%</span>
                  </div>
                  <Progress
                    value={data?.metrics.engagement_metrics.replay_rate || 0}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={data?.metrics.engagement_metrics.device_breakdown || []}
                  category="percentage"
                  index="device"
                  colors={["blue", "green", "yellow"]}
                  valueFormatter={(value) => `${value}%`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent
                  data={
                    data?.metrics.engagement_metrics.platform_distribution || []
                  }
                  category="percentage"
                  index="platform"
                  colors={["purple", "pink", "orange"]}
                  valueFormatter={(value) => `${value}%`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {Object.entries(data?.metrics.conversion_metrics || {}).map(
                  ([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{key.split("_").join(" ").toUpperCase()}</span>
                        <span>
                          {typeof value === "number" ? `${value}%` : value}
                        </span>
                      </div>
                      <Progress value={typeof value === "number" ? value : 0} />
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Social Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[data?.metrics.social_metrics || {}]}
                  categories={[
                    "shares",
                    "playlists_added",
                    "favorites",
                    "comments",
                  ]}
                  index="metric"
                  colors={["purple", "blue", "green", "yellow"]}
                  valueFormatter={(value) => value.toLocaleString()}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparative Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Genre Rank</span>
                  <Badge
                    variant={
                      data?.metrics.comparative_metrics.trend_direction === "up"
                        ? "success"
                        : "destructive"
                    }
                  >
                    {data?.metrics.comparative_metrics.genre_rank} /{" "}
                    {data?.metrics.comparative_metrics.total_tracks_in_genre}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trend</span>
                  <div className="flex items-center gap-2">
                    {data?.metrics.comparative_metrics.trend_direction ===
                    "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span>
                      {data?.metrics.comparative_metrics.trend_percentage}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
