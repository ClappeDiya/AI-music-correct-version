import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ModerationDashboardStats } from "@/lib/api/types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card className="w-full h-[400px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface CasesTrendChartProps {
  data: ModerationDashboardStats["trends"]["daily_cases"];
}

export function CasesTrendChart({ data }: CasesTrendChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      total: item.count,
      ...item.type_breakdown,
    }));
  }, [data]);

  return (
    <ChartCard title="Cases Trend">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="total" stroke="#8884d8" />
        <Line
          type="monotone"
          dataKey="copyright_infringement"
          stroke="#82ca9d"
        />
        <Line type="monotone" dataKey="license_breach" stroke="#ffc658" />
      </LineChart>
    </ChartCard>
  );
}

interface ResolutionRatesChartProps {
  data: ModerationDashboardStats["trends"]["resolution_rates"];
}

export function ResolutionRatesChart({ data }: ResolutionRatesChartProps) {
  const chartData = useMemo(() => {
    return [
      { name: "Upheld", value: data.upheld_percentage },
      { name: "Rejected", value: data.rejected_percentage },
      { name: "Settled", value: data.settlement_percentage },
    ];
  }, [data]);

  return (
    <ChartCard title="Resolution Rates">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ChartCard>
  );
}

interface CommonViolationsChartProps {
  data: ModerationDashboardStats["trends"]["common_violations"];
}

export function CommonViolationsChart({ data }: CommonViolationsChartProps) {
  const chartData = useMemo(() => {
    return data
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => ({
        type: item.type,
        count: item.count,
        trend: item.trend,
      }));
  }, [data]);

  return (
    <ChartCard title="Common Violations">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="type" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8884d8">
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartCard>
  );
}

interface ModeratorPerformanceChartProps {
  data: ModerationDashboardStats["moderator_performance"];
}

export function ModeratorPerformanceChart({
  data,
}: ModeratorPerformanceChartProps) {
  const chartData = useMemo(() => {
    return data
      .sort((a, b) => b.cases_handled - a.cases_handled)
      .slice(0, 5)
      .map((item) => ({
        moderator: `Mod ${item.moderator_id.slice(0, 4)}`,
        cases: item.cases_handled,
        resolution_time: item.average_resolution_time,
        satisfaction: item.satisfaction_rating,
      }));
  }, [data]);

  return (
    <ChartCard title="Moderator Performance">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="moderator" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="cases" fill="#8884d8" />
        <Bar yAxisId="right" dataKey="satisfaction" fill="#82ca9d" />
      </BarChart>
    </ChartCard>
  );
}
