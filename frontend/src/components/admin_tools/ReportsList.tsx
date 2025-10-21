import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Search } from "lucide-react";
import { adminToolsApi, ReportedContent } from "@/services/admin_tools/api";
import { useToast } from "@/components/ui/useToast";
import { StatusBadge } from "./shared/status-badge";
import { ContentFilters, FilterValues } from "./shared/content-filters";
import { ContentReviewDialog } from "./content-review-dialog";

export function ReportsList() {
  const [data, setData] = useState<ReportedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [filters, setFilters] = useState<FilterValues>({
    contentType: "",
    violationType: "",
    severity: "",
    dateRange: { from: undefined, to: undefined },
    status: "",
  });
  const [selectedContent, setSelectedContent] =
    useState<ReportedContent | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, [selectedTab, filters]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const status =
        selectedTab === "resolved"
          ? "resolved"
          : selectedTab === "open"
            ? "unassigned,in_progress"
            : "";

      const response = await adminToolsApi.getReportedContent({
        search: searchQuery,
        status,
        content_type: filters.contentType,
        violation_type: filters.violationType,
        severity: filters.severity,
        date_from: filters.dateRange.from?.toISOString(),
        date_to: filters.dateRange.to?.toISOString(),
      });
      setData(response.results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, notes: string) => {
    if (!selectedContent) return;

    try {
      await adminToolsApi.createModerationAction({
        target_ref: selectedContent.content_ref,
        action_type: action,
        action_details: {
          notes,
          report_id: selectedContent.id,
        },
      });

      await adminToolsApi.updateReportedContent(selectedContent.id, {
        status: action === "escalate" ? "escalated" : "resolved",
      });

      toast({
        title: "Success",
        description: `Content has been ${action}ed successfully`,
      });

      loadReports();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} content`,
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      accessorKey: "content_ref",
      header: "Content",
      cell: ({ row }) => {
        const [type, id] = row.original.content_ref.split(":");
        return (
          <div className="flex flex-col">
            <span className="font-medium">{type}</span>
            <span className="text-sm text-muted-foreground">ID: {id}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "reporter_user",
      header: "Reporter",
    },
    {
      accessorKey: "reason.reason_code",
      header: "Reason",
    },
    {
      accessorKey: "reported_at",
      header: "Date",
      cell: ({ row }) => new Date(row.original.reported_at).toLocaleString(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedContent(row.original);
            setReviewDialogOpen(true);
          }}
        >
          Review
        </Button>
      ),
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && loadReports()}
            />
          </div>
        </div>
        <Button onClick={loadReports}>Refresh</Button>
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>

      <ContentFilters onFilterChange={setFilters} />

      <DataTable columns={columns} data={data} pagination />

      <ContentReviewDialog
        content={selectedContent}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onAction={handleAction}
      />
    </div>
  );
}
