import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Progress } from "@/components/ui/Progress";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import {
  bulkActionsApi,
  BulkActionRequest,
  BulkActionProgress,
} from "@/services/admin_tools/bulk-actions";
import { useToast } from "@/components/ui/useToast";

interface BulkActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: BulkActionRequest["action"];
  targetIds: string[];
  targetType: "content" | "users";
  onComplete: () => void;
}

export function BulkActionDialog({
  open,
  onOpenChange,
  action,
  targetIds,
  targetType,
  onComplete,
}: BulkActionDialogProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("1");
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<BulkActionProgress | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (actionId) {
      interval = setInterval(async () => {
        try {
          const progress = await bulkActionsApi.getBulkActionProgress(actionId);
          setProgress(progress);

          if (progress.status === "completed") {
            clearInterval(interval);
            toast({
              title: "Bulk Action Completed",
              description: `Successfully processed ${progress.completed} of ${progress.total} items.`,
            });
            onComplete();
            onOpenChange(false);
          } else if (progress.status === "failed") {
            clearInterval(interval);
            toast({
              title: "Bulk Action Failed",
              description:
                "Some items could not be processed. Please check the error log.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error checking progress:", error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [actionId]);

  const handleSubmit = async () => {
    if (!reason) return;

    setLoading(true);
    try {
      const response = await bulkActionsApi.performBulkAction({
        action,
        targetIds,
        reason,
        notes: notes || undefined,
        duration: action === "suspend" ? parseInt(duration) : undefined,
      });
      setActionId(response.actionId);
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast({
        title: "Error",
        description: "Failed to start bulk action",
        variant: "destructive",
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (action) {
      case "remove":
      case "ban":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warn":
      case "suspend":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTitle = () => {
    const count = targetIds.length;
    switch (action) {
      case "remove":
        return `Remove ${count} ${targetType}`;
      case "deactivate":
        return `Deactivate ${count} ${targetType}`;
      case "warn":
        return `Warn ${count} ${targetType}`;
      case "suspend":
        return `Suspend ${count} ${targetType}`;
      case "ban":
        return `Ban ${count} ${targetType}`;
      default:
        return `Bulk Action: ${count} ${targetType}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            This action will affect {targetIds.length} {targetType}. Please
            confirm your intention and provide a reason.
          </DialogDescription>
        </DialogHeader>

        {progress ? (
          <div className="space-y-4 py-4">
            <Progress value={(progress.completed / progress.total) * 100} />
            <div className="text-sm text-muted-foreground">
              Processed {progress.completed} of {progress.total} items
              {progress.failed > 0 && ` (${progress.failed} failed)`}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {action === "suspend" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (days)</label>
                <Input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Input
                placeholder="Enter reason for action"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes</label>
              <Textarea
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {!progress && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant={
                  action === "ban" || action === "remove"
                    ? "destructive"
                    : "default"
                }
                onClick={handleSubmit}
                disabled={!reason || loading}
              >
                Confirm Action
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
