import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { useFeatureFlagAdmin } from "@/lib/hooks/UseFeatureFlags";

interface MetricsOverviewProps {
  environment: string;
}

export function MetricsOverview({ environment }: MetricsOverviewProps) {
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date(),
  ]);
  const [metricType, setMetricType] = useState("activations");

  const { flags } = useFeatureFlagAdmin();

  // Mock data - replace with real API calls
  const activationData = [
    { date: "2025-01-22", activations: 120, errors: 5 },
    { date: "2025-01-23", activations: 132, errors: 3 },
    { date: "2025-01-24", activations: 145, errors: 4 },
    { date: "2025-01-25", activations: 160, errors: 2 },
    { date: "2025-01-26", activations: 178, errors: 6 },
    { date: "2025-01-27", activations: 195, errors: 3 },
    { date: "2025-01-28", activations: 205, errors: 4 },
  ];

  const flagUsageData = flags?.map((flag) => ({
    name: flag.name,
    activations: Math.floor(Math.random() * 1000),
    errors: Math.floor(Math.random() * 50),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Metrics Overview</h2>
          <p className="text-sm text-muted-foreground">
            Monitor feature flag performance and usage
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={metricType} onValueChange={setMetricType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activations">Activations</SelectItem>
              <SelectItem value="errors">Errors</SelectItem>
              <SelectItem value="latency">Latency</SelectItem>
            </SelectContent>
          </Select>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="activations"
                    stroke="#10b981"
                    name="Activations"
                  />
                  <Line
                    type="monotone"
                    dataKey="errors"
                    stroke="#ef4444"
                    name="Errors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flag Usage Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flagUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="activations"
                    fill="#10b981"
                    name="Activations"
                  />
                  <Bar dataKey="errors" fill="#ef4444" name="Errors" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background">
                <div className="text-sm font-medium text-muted-foreground">
                  Average Response Time
                </div>
                <div className="text-2xl font-bold">45ms</div>
                <div className="text-sm text-green-500">
                  ↓ 12% from last week
                </div>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <div className="text-sm font-medium text-muted-foreground">
                  Error Rate
                </div>
                <div className="text-2xl font-bold">2.3%</div>
                <div className="text-sm text-red-500">
                  ↑ 0.5% from last week
                </div>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <div className="text-sm font-medium text-muted-foreground">
                  Cache Hit Rate
                </div>
                <div className="text-2xl font-bold">94.8%</div>
                <div className="text-sm text-green-500">
                  ↑ 2.1% from last week
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
