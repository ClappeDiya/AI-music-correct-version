import { useApiQuery } from "@/lib/hooks/use-api-query";
import { externalUsageLogsApi } from "@/lib/api/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { DatePickerWithRange } from "@/components/ui/DateRangePicker";
import {
  BarChart,
  LineChart,
  PieChart,
  Download,
  TrendingUp,
  Globe,
  AlertCircle,
  Filter,
} from "lucide-react";
import { useState } from "react";

// Mock chart components - replace with your preferred chart library
const LineChartComponent = () => (
  <div className="h-[300px] flex items-center justify-center bg-muted">
    Line Chart Placeholder
  </div>
);

const BarChartComponent = () => (
  <div className="h-[300px] flex items-center justify-center bg-muted">
    Bar Chart Placeholder
  </div>
);

const PieChartComponent = () => (
  <div className="h-[300px] flex items-center justify-center bg-muted">
    Pie Chart Placeholder
  </div>
);

export function UsageReporting() {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });
  const [platform, setPlatform] = useState("all");
  const [reportType, setReportType] = useState("overview");

  const { data, isLoading } = useApiQuery(
    "usage-analytics",
    externalUsageLogsApi,
    {
      timestamp__gte: dateRange.from?.toISOString(),
      timestamp__lte: dateRange.to?.toISOString(),
      platform: platform !== "all" ? platform : undefined,
      analytics: true,
    },
  );

  const totalUsage =
    data?.results.reduce((sum, log) => sum + log.usage_count, 0) || 0;
  const complianceRate = 98.5; // Mock value - replace with actual calculation
  const growthRate = 15.3; // Mock value - replace with actual calculation

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usage Analytics</h2>
          <p className="text-muted-foreground">
            Analyze and track usage patterns across platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="platform">Platform Analysis</SelectItem>
              <SelectItem value="compliance">Compliance Report</SelectItem>
              <SelectItem value="trends">Usage Trends</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsage.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growthRate}%</div>
            <p className="text-xs text-muted-foreground">Month over month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Platforms
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(data?.results.map((log) => log.platform)).size || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all regions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Rate
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {complianceRate}%
            </div>
            <p className="text-xs text-muted-foreground">Usage compliance</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </div>
        <div className="w-[200px]">
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="spotify">Spotify</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>Track usage patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartComponent />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>Usage breakdown by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChartComponent />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage by Type</CardTitle>
              <CardDescription>Distribution across usage types</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent />
            </CardContent>
          </Card>
        </div>

        {reportType === "compliance" && (
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
              <CardDescription>
                Track compliance metrics and violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-1">License Violations</h4>
                    <p className="text-2xl font-bold text-destructive">12</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-1">Attribution Issues</h4>
                    <p className="text-2xl font-bold text-yellow-600">24</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-1">Resolved Cases</h4>
                    <p className="text-2xl font-bold text-green-600">89</p>
                  </div>
                </div>
                <BarChartComponent />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
