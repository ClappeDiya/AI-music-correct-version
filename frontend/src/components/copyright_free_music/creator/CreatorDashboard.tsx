import { useState } from "react";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { creatorStatsApi, royaltyEarningsApi } from "@/lib/api/services";
import { CreatorStats, RoyaltyEarning } from "@/lib/api/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  DollarSign,
  Music,
  PlayCircle,
  Download,
  License,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

export function CreatorDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats } = useApiQuery(["creator-stats", timeRange], () =>
    creatorStatsApi.getStats({ timeRange }),
  );

  const { data: earnings } = useApiQuery(["royalty-earnings", timeRange], () =>
    royaltyEarningsApi.list({ params: { timeRange } }),
  );

  const timeRanges = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "1y", label: "Last Year" },
  ];

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
  }: {
    title: string;
    value: string | number;
    description?: string;
    icon: any;
    trend?: number;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center text-xs">
            <TrendingUp
              className={`h-3 w-3 ${
                trend > 0 ? "text-green-500" : "text-red-500"
              }`}
            />
            <span className={trend > 0 ? "text-green-500" : "text-red-500"}>
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
            <span className="text-muted-foreground ml-1">vs. last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const getPaymentStatusIcon = (status: RoyaltyEarning["payment_status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Creator Dashboard</h2>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="tracks">Tracks</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Earnings"
              value={`$${stats?.total_earnings.toLocaleString()}`}
              icon={DollarSign}
              trend={15}
            />
            <StatCard
              title="Total Tracks"
              value={stats?.track_stats.total_tracks || 0}
              icon={Music}
            />
            <StatCard
              title="Total Plays"
              value={stats?.track_stats.total_plays.toLocaleString() || 0}
              icon={PlayCircle}
              trend={8}
            />
            <StatCard
              title="Total Downloads"
              value={stats?.track_stats.total_downloads.toLocaleString() || 0}
              icon={Download}
              trend={5}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Earnings Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.earnings_by_period || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--primary)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Tracks</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Track</TableHead>
                        <TableHead>Plays</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead>Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.popular_tracks.map((track) => (
                        <TableRow key={track.track_id}>
                          <TableCell>{track.title}</TableCell>
                          <TableCell>{track.plays.toLocaleString()}</TableCell>
                          <TableCell>
                            {track.downloads.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ${track.earnings.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>License Tier Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.license_tiers || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total_sales" fill="var(--primary)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Royalty Earnings</CardTitle>
              <CardDescription>
                Track your earnings from licenses and usage royalties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earnings?.results.map((earning) => (
                      <TableRow key={earning.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {new Date(earning.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {earning.earning_type === "license_purchase"
                              ? "License Sale"
                              : "Usage Royalty"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            {earning.amount} {earning.currency}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentStatusIcon(earning.payment_status)}
                            <span className="capitalize">
                              {earning.payment_status}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracks" className="space-y-6">
          {/* Track management content */}
        </TabsContent>

        <TabsContent value="licenses" className="space-y-6">
          {/* License tier management content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
