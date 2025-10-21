import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { StatusBadge } from "./shared/status-badge";
import { ReportedContent } from "@/services/admin_tools/api";
import { Check, X, AlertTriangle, ArrowUpCircle } from "lucide-react";

interface ContentReviewDialogProps {
  content: ReportedContent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: string, notes: string) => Promise<void>;
}

export function ContentReviewDialog({
  content,
  open,
  onOpenChange,
  onAction,
}: ContentReviewDialogProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      await onAction(action, notes);
      onOpenChange(false);
    } catch (error) {
      console.error("Error performing action:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Content Review</span>
            <StatusBadge status={content.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold">Content Type</h4>
              <p className="text-sm text-muted-foreground">
                {content.content_ref.split(":")[0]}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Reported At</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(content.reported_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Reason</h4>
            <p className="text-sm text-muted-foreground">
              {content.reason?.description || content.reason?.reason_code}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Additional Details</h4>
            <p className="text-sm text-muted-foreground">
              {JSON.stringify(content.additional_details, null, 2)}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Moderation Notes</h4>
            <Textarea
              placeholder="Add your notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-24"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleAction("approve")}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <Check className="mr-2 h-4 w-4" />
            Approve Content
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleAction("delete")}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Delete Content
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleAction("escalate")}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Escalate
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleAction("warn")}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Warn User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
