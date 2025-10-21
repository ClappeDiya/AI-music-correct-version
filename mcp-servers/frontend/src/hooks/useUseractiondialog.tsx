import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { AlertTriangle, Ban, Clock } from "lucide-react";
import {
  UserProfile,
  UserAction,
} from "@/services/admin_tools/user-management";

interface UserActionDialogProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: UserAction) => Promise<void>;
}

export function UserActionDialog({
  user,
  open,
  onOpenChange,
  onAction,
}: UserActionDialogProps) {
  const [actionType, setActionType] = useState<UserAction["type"]>("warning");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("1");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;

    setLoading(true);
    try {
      await onAction({
        type: actionType,
        reason,
        duration: actionType === "suspension" ? parseInt(duration) : undefined,
        notes: notes || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error performing action:", error);
    } finally {
      setLoading(false);
    }
  };

  const actionIcons = {
    warning: AlertTriangle,
    suspension: Clock,
    ban: Ban,
  };

  const ActionIcon = actionIcons[actionType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ActionIcon className="h-5 w-5" />
            Take Action on User: {user.username}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Action Type</label>
            <Select
              value={actionType}
              onValueChange={(value: UserAction["type"]) =>
                setActionType(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warning">Issue Warning</SelectItem>
                <SelectItem value="suspension">Suspend Account</SelectItem>
                <SelectItem value="ban">Ban Account</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {actionType === "suspension" && (
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={actionType === "ban" ? "destructive" : "default"}
            onClick={handleSubmit}
            disabled={!reason || loading}
          >
            Confirm Action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
