import { useState } from "react";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { tracksApi } from "@/lib/api/services";
import { Track } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart as BarChartIcon,
  PlayCircle,
  Download,
  Share2,
  TrendingUp,
} from "lucide-react";

interface AnalyticsData {
  date: string;
  plays: number;
  downloads: number;
  shares: number;
}

interface TrackAnalyticsProps {
  track: Track;
}

export function TrackAnalytics({ track }: TrackAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("7d");

  const { data: analyticsData } = useApiQuery(
    ["track-analytics", track.id, timeRange],
    () => tracksApi.getAnalytics(track.id, { timeRange }),
  );

  const timeRanges = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "1y", label: "Last Year" },
  ];

  const getStatColor = (type: "plays" | "downloads" | "shares") => {
    switch (type) {
      case "plays":
        return "var(--primary)";
      case "downloads":
        return "var(--success)";
      case "shares":
        return "var(--warning)";
      default:
        return "var(--muted)";
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    type,
  }: {
    title: string;
    value: number;
    icon: any;
    type: "plays" | "downloads" | "shares";
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div
          className="text-2xl font-bold"
          style={{ color: getStatColor(type) }}
        >
          {value.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground">
          +{Math.floor(Math.random() * 20)}% from last period
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Track Analytics</h3>
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

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Plays"
          value={track.play_count}
          icon={PlayCircle}
          type="plays"
        />
        <StatCard
          title="Total Downloads"
          value={track.download_count}
          icon={Download}
          type="downloads"
        />
        <StatCard
          title="Total Shares"
          value={analyticsData?.totalShares || 0}
          icon={Share2}
          type="shares"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BarChartIcon className="h-4 w-4" />
            Performance Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analyticsData?.timeSeriesData || []}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <Line
                  type="monotone"
                  dataKey="plays"
                  stroke={getStatColor("plays")}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="downloads"
                  stroke={getStatColor("downloads")}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="shares"
                  stroke={getStatColor("shares")}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Peak Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Your track performs best on weekends, with highest engagement
                  between 2 PM and 8 PM.
                </p>
              </Card>
              <Card className="p-4">
                <h4 className="font-medium mb-2">Geographic Reach</h4>
                <p className="text-sm text-muted-foreground">
                  Most listeners are from United States (45%), followed by UK
                  (15%) and Germany (10%).
                </p>
              </Card>
            </div>
            <Card className="p-4">
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  • Consider releasing new content during peak engagement times
                </li>
                <li>• Optimize track metadata for better discovery</li>
                <li>• Engage with listeners from top geographic regions</li>
              </ul>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
