import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Check, X, ArrowUpCircle, Eye } from "lucide-react";
import { adminToolsApi, ReportedContent } from "@/services/admin_tools/api";
import { useToast } from "@/components/ui/useToast";
import { StatusBadge } from "./shared/status-badge";
import { ContentFilters, FilterValues } from "./shared/content-filters";
import { ContentReviewDialog } from "./content-review-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/Checkbox";
import { BulkActionDialog } from "./bulk-action-dialog";

export function ModerationQueue() {
  const [data, setData] = useState<ReportedContent[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<"remove" | "approve" | null>(
    null,
  );
  const { toast } = useToast();

  useEffect(() => {
    loadQueue();
  }, [filters]);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const response = await adminToolsApi.getReportedContent({
        content_type: filters.contentType,
        violation_type: filters.violationType,
        severity: filters.severity,
        date_from: filters.dateRange.from?.toISOString(),
        date_to: filters.dateRange.to?.toISOString(),
        status: filters.status || "unassigned",
      });
      setData(response.results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load moderation queue",
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

      loadQueue();
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
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
      accessorKey: "reason.reason_code",
      header: "Reason",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.reason.reason_code}</Badge>
      ),
    },
    {
      accessorKey: "reported_at",
      header: "Reported",
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedContent(row.original);
              setReviewDialogOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAction("approve", "")}>
                <Check className="mr-2 h-4 w-4" /> Approve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("delete", "")}>
                <X className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("escalate", "")}>
                <ArrowUpCircle className="mr-2 h-4 w-4" /> Escalate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const handleBulkAction = (action: "remove" | "approve") => {
    if (selectedRows.length === 0) return;
    setBulkAction(action);
    setBulkActionOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Moderation Queue</h2>
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => handleBulkAction("approve")}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Approve Selected ({selectedRows.length})
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleBulkAction("remove")}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Remove Selected ({selectedRows.length})
              </Button>
            </>
          )}
          <Button onClick={loadQueue}>Refresh</Button>
        </div>
      </div>

      <ContentFilters onFilterChange={setFilters} />

      <DataTable
        columns={columns}
        data={data}
        pagination
        onRowSelectionChange={(rows) => setSelectedRows(Array.from(rows))}
      />

      <ContentReviewDialog
        content={selectedContent}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onAction={handleAction}
      />

      {bulkAction && (
        <BulkActionDialog
          open={bulkActionOpen}
          onOpenChange={setBulkActionOpen}
          action={bulkAction === "approve" ? "approve" : "remove"}
          targetIds={selectedRows}
          targetType="content"
          onComplete={() => {
            setSelectedRows([]);
            loadQueue();
          }}
        />
      )}
    </div>
  );
}
