import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Brain,
} from "lucide-react";
import {
  aiModerationApi,
  ContentFlag,
} from "@/services/admin_tools/AiModeration";
import { useToast } from "@/components/ui/useToast";
import { FlagDetailsDialog } from "./flag-details-dialog";

const confidenceColors = {
  high: "bg-red-500/20 text-red-700",
  medium: "bg-yellow-500/20 text-yellow-700",
  low: "bg-blue-500/20 text-blue-700",
};

const getConfidenceLevel = (score: number) => {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
};

export function AIModerationDashboard() {
  const [flags, setFlags] = useState<ContentFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedFlag, setSelectedFlag] = useState<ContentFlag | null>(null);
  const [flagDetailsOpen, setFlagDetailsOpen] = useState(false);
  const [contentTypeFilter, setContentTypeFilter] = useState("");
  const [flagTypeFilter, setFlagTypeFilter] = useState("");
  const [selectedTab, setSelectedTab] = useState("pending");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [contentTypeFilter, flagTypeFilter, selectedTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [flagsResponse, statsResponse] = await Promise.all([
        aiModerationApi.getFlaggedContent({
          content_type: contentTypeFilter,
          flag_type: flagTypeFilter,
          status: selectedTab,
        }),
        aiModerationApi.getStats(),
      ]);
      setFlags(flagsResponse.results);
      setStats(statsResponse);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load AI moderation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (
    flag: ContentFlag,
    decision: "approve" | "reject" | "escalate",
  ) => {
    try {
      await aiModerationApi.submitDecision(flag.id, { decision });
      toast({
        title: "Success",
        description: "Decision submitted successfully",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit decision",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      accessorKey: "content_type",
      header: "Content Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.content_type}</Badge>
      ),
    },
    {
      accessorKey: "flag_type",
      header: "Flag Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.flag_type}</Badge>
      ),
    },
    {
      accessorKey: "confidence_score",
      header: "AI Confidence",
      cell: ({ row }) => {
        const level = getConfidenceLevel(row.original.confidence_score);
        return (
          <div className="flex items-center gap-2">
            <Badge className={confidenceColors[level]}>
              {Math.round(row.original.confidence_score * 100)}%
            </Badge>
            {level === "high" && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Detected",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedFlag(row.original);
              setFlagDetailsOpen(true);
            }}
          >
            Review
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-green-600"
            onClick={() => handleDecision(row.original, "approve")}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600"
            onClick={() => handleDecision(row.original, "reject")}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading && !stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Moderation</h2>
        <Button onClick={loadData}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_flags || 0}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pending_flags || 0}
            </div>
            <Progress
              value={
                ((stats?.pending_flags || 0) / (stats?.total_flags || 1)) * 100
              }
              className="h-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats?.ai_accuracy || 0) * 100)}%
            </div>
            <Progress value={(stats?.ai_accuracy || 0) * 100} className="h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avg_response_time || 0}s
            </div>
            <p className="text-xs text-muted-foreground">Average review time</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Content Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="lyrics">Lyrics</SelectItem>
            <SelectItem value="comment">Comments</SelectItem>
            <SelectItem value="profile">Profiles</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
          </SelectContent>
        </Select>

        <Select value={flagTypeFilter} onValueChange={setFlagTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Flag Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Flags</SelectItem>
            <SelectItem value="hate_speech">Hate Speech</SelectItem>
            <SelectItem value="explicit">Explicit Content</SelectItem>
            <SelectItem value="copyright">Copyright</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="quarantined" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Quarantined
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <DataTable columns={columns} data={flags} pagination />
      </Tabs>

      {selectedFlag && (
        <FlagDetailsDialog
          flag={selectedFlag}
          open={flagDetailsOpen}
          onOpenChange={setFlagDetailsOpen}
          onDecision={handleDecision}
        />
      )}
    </div>
  );
}
