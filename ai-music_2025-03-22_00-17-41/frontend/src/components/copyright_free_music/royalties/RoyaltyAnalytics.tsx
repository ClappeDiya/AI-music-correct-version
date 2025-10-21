import { useApiQuery } from "@/lib/hooks/use-api-query";
import { royaltyTransactionsApi } from "@/lib/api/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  DollarSign,
  TrendingUp,
  BarChart,
  Download,
  PieChart,
  Globe,
} from "lucide-react";
import { useState } from "react";

// Mock chart components - replace with your preferred chart library
const LineChart = () => (
  <div className="h-[300px] flex items-center justify-center bg-muted">
    Line Chart Placeholder
  </div>
);

const PieChartComponent = () => (
  <div className="h-[300px] flex items-center justify-center bg-muted">
    Pie Chart Placeholder
  </div>
);

const BarChartComponent = () => (
  <div className="h-[300px] flex items-center justify-center bg-muted">
    Bar Chart Placeholder
  </div>
);

export function RoyaltyAnalytics() {
  const [timeframe, setTimeframe] = useState("month");
  const [groupBy, setGroupBy] = useState("track");

  const { data, isLoading } = useApiQuery(
    "royalty-analytics",
    royaltyTransactionsApi,
    {
      timeframe,
      group_by: groupBy,
    },
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Royalty Analytics
          </h2>
          <p className="text-muted-foreground">
            Analyze your earnings and track performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,345</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Per Track
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$123</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.3%</div>
            <p className="text-xs text-muted-foreground">
              +2.4% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Markets
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 from last period</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Track your earnings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Revenue breakdown by {groupBy}</CardDescription>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-[150px] mt-2">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="track">Track</SelectItem>
                <SelectItem value="license">License Type</SelectItem>
                <SelectItem value="region">Region</SelectItem>
                <SelectItem value="usage">Usage Type</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <PieChartComponent />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance by Track</CardTitle>
          <CardDescription>Compare revenue across your tracks</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChartComponent />
        </CardContent>
      </Card>
    </div>
  );
}
