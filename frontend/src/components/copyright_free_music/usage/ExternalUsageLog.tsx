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
import { Badge } from "@/components/ui/Badge";
import { DataTableView } from "../data-table/data-table-view";
import {
  Globe,
  Music,
  Calendar,
  PlayCircle,
  Download,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { DatePickerWithRange } from "@/components/ui/DateRangePicker";
import { useState } from "react";

const USAGE_TYPES = {
  streaming: { label: "Streaming", color: "default" },
  download: { label: "Download", color: "success" },
  broadcast: { label: "Broadcast", color: "warning" },
  sync: { label: "Sync", color: "info" },
};

const columns = [
  {
    accessorKey: "track.title",
    header: "Track",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Music className="h-4 w-4" />
        <span>{row.original.track.title}</span>
      </div>
    ),
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <span>{row.original.platform}</span>
      </div>
    ),
  },
  {
    accessorKey: "usage_type",
    header: "Usage Type",
    cell: ({ row }) => {
      const usage =
        USAGE_TYPES[row.original.usage_type as keyof typeof USAGE_TYPES];
      return (
        <Badge variant={usage?.color || "default"}>
          {usage?.label || row.original.usage_type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "usage_count",
    header: "Count",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <PlayCircle className="h-4 w-4" />
        <span>{row.original.usage_count.toLocaleString()}</span>
      </div>
    ),
  },
  {
    accessorKey: "timestamp",
    header: "Date",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span>{format(new Date(row.original.timestamp), "PP")}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusColors = {
        verified: "success",
        pending: "warning",
        flagged: "destructive",
      };
      return (
        <Badge
          variant={
            statusColors[row.original.status as keyof typeof statusColors]
          }
        >
          {row.original.status}
        </Badge>
      );
    },
  },
];

export function ExternalUsageLog() {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });
  const [platform, setPlatform] = useState("all");
  const [usageType, setUsageType] = useState("all");

  const { data, isLoading } = useApiQuery(
    "external-usage",
    externalUsageLogsApi,
    {
      timestamp__gte: dateRange.from?.toISOString(),
      timestamp__lte: dateRange.to?.toISOString(),
      platform: platform !== "all" ? platform : undefined,
      usage_type: usageType !== "all" ? usageType : undefined,
    },
  );

  const totalUsage =
    data?.results.reduce((sum, log) => sum + log.usage_count, 0) || 0;
  const flaggedUsage =
    data?.results.filter((log) => log.status === "flagged").length || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsage.toLocaleString()}
            </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Usage</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {flaggedUsage}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.results
                .filter((log) => log.usage_type === "download")
                .reduce((sum, log) => sum + log.usage_count, 0)
                .toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>External Usage Log</CardTitle>
          <CardDescription>
            Track and monitor usage of your music across external platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
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
            <div className="w-[200px]">
              <Select value={usageType} onValueChange={setUsageType}>
                <SelectTrigger>
                  <SelectValue placeholder="Usage Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="streaming">Streaming</SelectItem>
                  <SelectItem value="download">Download</SelectItem>
                  <SelectItem value="broadcast">Broadcast</SelectItem>
                  <SelectItem value="sync">Sync</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <DataTableView
            columns={columns}
            data={data?.results || []}
            isLoading={isLoading}
            searchPlaceholder="Search usage logs..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
