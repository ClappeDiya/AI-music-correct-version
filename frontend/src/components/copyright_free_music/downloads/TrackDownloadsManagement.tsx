import { useState } from "react";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { trackDownloadsApi } from "@/lib/api/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { DataTableView } from "../data-table/data-table-view";
import {
  Music,
  Download,
  Calendar,
  Globe,
  User,
  TrendingUp,
  HardDrive,
  Activity,
} from "lucide-react";
import { format } from "date-fns";

export function TrackDownloadsManagement() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [formatFilter, setFormatFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  const { data, isLoading } = useApiQuery(
    "track-downloads",
    trackDownloadsApi,
    {
      downloaded_at__gte: dateRange.from.toISOString(),
      downloaded_at__lte: dateRange.to.toISOString(),
      format: formatFilter !== "all" ? formatFilter : undefined,
      region: regionFilter !== "all" ? regionFilter : undefined,
    },
  );

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
      accessorKey: "downloader.name",
      header: "Downloaded By",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{row.original.downloader.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "format",
      header: "Format",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.format.toUpperCase()}</Badge>
      ),
    },
    {
      accessorKey: "file_size",
      header: "File Size",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4" />
          <span>{formatFileSize(row.original.file_size)}</span>
        </div>
      ),
    },
    {
      accessorKey: "region",
      header: "Region",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{row.original.region}</span>
        </div>
      ),
    },
    {
      accessorKey: "downloaded_at",
      header: "Download Date",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(row.original.downloaded_at), "PPp")}</span>
        </div>
      ),
    },
    {
      accessorKey: "download_speed",
      header: "Speed",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span>{formatSpeed(row.original.download_speed)}</span>
        </div>
      ),
    },
  ];

  // Helper function to format file sizes
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Helper function to format download speeds
  const formatSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond === 0) return "0 B/s";
    const k = 1024;
    const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return `${parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Calculate statistics
  const totalDownloads = data?.results.length || 0;
  const totalDataTransferred =
    data?.results.reduce((sum, download) => sum + download.file_size, 0) || 0;
  const uniqueUsers =
    new Set(data?.results.map((download) => download.downloader.id)).size || 0;
  const averageSpeed =
    data?.results.reduce((sum, download) => sum + download.download_speed, 0) /
      totalDownloads || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Downloads
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Data Transferred
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(totalDataTransferred)}
            </div>
            <p className="text-xs text-muted-foreground">Total download size</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              Distinct downloaders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Speed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatSpeed(averageSpeed)}
            </div>
            <p className="text-xs text-muted-foreground">Mean download rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Track Downloads</CardTitle>
          <CardDescription>Monitor and analyze track downloads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={dateRange.from.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      from: new Date(e.target.value),
                    }))
                  }
                />
                <Input
                  type="date"
                  value={dateRange.to.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      to: new Date(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Format</Label>
              <Select value={formatFilter} onValueChange={setFormatFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="wav">WAV</SelectItem>
                  <SelectItem value="flac">FLAC</SelectItem>
                  <SelectItem value="aiff">AIFF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Region</Label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="na">North America</SelectItem>
                  <SelectItem value="eu">Europe</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline">Export Report</Button>
            </div>
          </div>

          <DataTableView
            columns={columns}
            data={data?.results || []}
            isLoading={isLoading}
            searchPlaceholder="Search downloads..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
