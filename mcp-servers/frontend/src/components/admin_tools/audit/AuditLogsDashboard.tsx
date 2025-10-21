import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Ban,
  Calendar as CalendarIcon,
  Download,
  FileText,
  Filter,
  Search,
  Trash2,
  UserX,
  AlertTriangle,
  CheckCircle,
  Settings,
  Brain,
} from "lucide-react";
import { format } from "date-fns";
import {
  auditLogsApi,
  AuditLog,
  ExportOptions,
} from "@/services/admin_tools/AuditLogs";
import { useToast } from "@/components/ui/useToast";
import { LogDetailsDialog } from "./log-details-dialog";

const actionIcons = {
  content_removal: Trash2,
  user_ban: Ban,
  user_warning: AlertTriangle,
  user_suspension: UserX,
  content_approval: CheckCircle,
  report_resolution: FileText,
  ai_override: Brain,
  settings_change: Settings,
};

export function AuditLogsDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    null,
  );
  const [actionTypeFilter, setActionTypeFilter] = useState("");
  const [moderatorFilter, setModeratorFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [dateRange, actionTypeFilter, moderatorFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsResponse, statsResponse] = await Promise.all([
        auditLogsApi.getLogs({
          from: dateRange?.from?.toISOString(),
          to: dateRange?.to?.toISOString(),
          action_type: actionTypeFilter,
          moderator_id: moderatorFilter,
          search: searchQuery,
        }),
        auditLogsApi.getStats(
          dateRange
            ? {
                from: dateRange.from.toISOString(),
                to: dateRange.to.toISOString(),
              }
            : undefined,
        ),
      ]);
      setLogs(logsResponse.results);
      setStats(statsResponse);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      const blob = await auditLogsApi.exportLogs({
        format,
        dateRange: dateRange
          ? {
              from: dateRange.from.toISOString(),
              to: dateRange.to.toISOString(),
            }
          : undefined,
        filters: {
          action_type: actionTypeFilter ? [actionTypeFilter] : undefined,
          moderator_id: moderatorFilter,
        },
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${format}-${format(new Date(), "yyyy-MM-dd")}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `Logs exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export logs",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => format(new Date(row.original.timestamp), "PPp"),
    },
    {
      accessorKey: "action_type",
      header: "Action",
      cell: ({ row }) => {
        const Icon = actionIcons[row.original.action_type];
        return (
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            <span className="capitalize">
              {row.original.action_type.replace(/_/g, " ")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "moderator.username",
      header: "Moderator",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.moderator.username}</Badge>
      ),
    },
    {
      accessorKey: "target_type",
      header: "Target",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="capitalize">{row.original.target_type}</span>
          <span className="text-sm text-muted-foreground truncate">
            {row.original.target_ref}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedLog(row.original);
            setDetailsOpen(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  if (loading && !stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Audit Logs</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            className="w-full sm:w-auto"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_actions || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Content Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.content_actions || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">User Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.user_actions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Moderators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.active_moderators || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && loadData()}
            />
          </div>

          <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="content_removal">Content Removal</SelectItem>
              <SelectItem value="user_ban">User Ban</SelectItem>
              <SelectItem value="user_warning">User Warning</SelectItem>
              <SelectItem value="user_suspension">User Suspension</SelectItem>
              <SelectItem value="content_approval">Content Approval</SelectItem>
              <SelectItem value="report_resolution">
                Report Resolution
              </SelectItem>
              <SelectItem value="ai_override">AI Override</SelectItem>
              <SelectItem value="settings_change">Settings Change</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setDateRange(null);
            setActionTypeFilter("");
            setModeratorFilter("");
            setSearchQuery("");
            loadData();
          }}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <DataTable columns={columns} data={logs} pagination />

      {selectedLog && (
        <LogDetailsDialog
          log={selectedLog}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </div>
  );
}
