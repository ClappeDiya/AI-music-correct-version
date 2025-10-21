import { useState } from "react";
import {
  useModeration,
  useModerationAnalytics,
} from "@/lib/hooks/use-moderation";
import {
  CasesTrendChart,
  ResolutionRatesChart,
  CommonViolationsChart,
  ModeratorPerformanceChart,
} from "../analytics/charts";
import { NotificationCenter } from "../notifications/notification-center";
import { Button } from "@/components/ui/Button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  MoreVertical,
  RefreshCcw,
  Shield,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRIORITY_BADGES = {
  low: { color: "bg-blue-500/10 text-blue-500", icon: Clock },
  medium: { color: "bg-yellow-500/10 text-yellow-500", icon: AlertTriangle },
  high: { color: "bg-orange-500/10 text-orange-500", icon: AlertTriangle },
  urgent: { color: "bg-red-500/10 text-red-500", icon: AlertTriangle },
};

const STATUS_BADGES = {
  open: { color: "bg-blue-500/10 text-blue-500", icon: Clock },
  underReview: { color: "bg-yellow-500/10 text-yellow-500", icon: Shield },
  resolved: { color: "bg-green-500/10 text-green-500", icon: CheckCircle },
  appealed: { color: "bg-purple-500/10 text-purple-500", icon: RefreshCcw },
  closed: { color: "bg-gray-500/10 text-gray-500", icon: CheckCircle },
};

export function ModerationDashboard() {
  const {
    queue,
    stats,
    flaggedTracks,
    isQueueLoading,
    filters,
    updateFilters,
    assignModerator,
    takeAction,
  } = useModeration();

  const { calculateTrends } = useModerationAnalytics();
  const [selectedTab, setSelectedTab] = useState("queue");

  const handleAssignModerator = async (caseId: string, moderatorId: string) => {
    await assignModerator({ caseId, moderatorId });
  };

  const handleAction = async (
    caseId: string,
    action: string,
    reason: string,
  ) => {
    await takeAction({
      caseId,
      action: {
        id: "",
        caseId: caseId,
        moderatorId: "current-moderator-id",
        actionType: action as any,
        timestamp: new Date().toISOString(),
        reason,
        details: "",
        appealAllowed: true,
        notificationSent: false,
      },
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Moderation Dashboard</h1>
          <p className="text-muted-foreground">
            Manage disputes, review content, and monitor platform activity
          </p>
        </div>
        <NotificationCenter />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.open_cases}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolution Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateTrends?.resolutionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Resolution Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateTrends?.averageResolutionTime.toFixed(1)}h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Moderators
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.moderator_performance.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Cases</CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={filters.status}
                    onValueChange={(value) => updateFilters({ status: value })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="underReview">Under Review</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) =>
                      updateFilters({ priority: value })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.caseNumber}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={STATUS_BADGES[item.status].color}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={PRIORITY_BADGES[item.priority].color}
                          >
                            {item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAction(item.id, "warning", "")
                                }
                              >
                                Issue Warning
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAction(item.id, "takedown", "")
                                }
                              >
                                Take Down Content
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction(item.id, "ban", "")}
                              >
                                Ban User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CasesTrendChart data={stats?.trends.daily_cases || []} />
            <ResolutionRatesChart
              data={
                stats?.trends.resolution_rates || {
                  upheld_percentage: 0,
                  rejected_percentage: 0,
                  settlement_percentage: 0,
                }
              }
            />
            <CommonViolationsChart
              data={stats?.trends.common_violations || []}
            />
            <ModeratorPerformanceChart
              data={stats?.moderator_performance || []}
            />
          </div>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Content</CardTitle>
              <CardDescription>
                Review and moderate flagged content across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Track</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedTracks?.map((track) => (
                      <TableRow key={track.id}>
                        <TableCell>{track.title}</TableCell>
                        <TableCell>{track.flagCount}</TableCell>
                        <TableCell>{track.flagReason}</TableCell>
                        <TableCell>
                          {new Date(track.flaggedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
