import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Ban,
  Trash2,
  UserX,
  AlertTriangle,
  CheckCircle,
  FileText,
  Brain,
  Settings,
  Clock,
  User,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { AuditLog } from "@/services/admin_tools/AuditLogs";

interface LogDetailsDialogProps {
  log: AuditLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function LogDetailsDialog({
  log,
  open,
  onOpenChange,
}: LogDetailsDialogProps) {
  const Icon = actionIcons[log.action_type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            Audit Log Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timestamp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {format(new Date(log.timestamp), "PPpp")}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Moderator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <Badge variant="outline" className="w-fit">
                      {log.moderator.username}
                    </Badge>
                    <span className="text-sm text-muted-foreground mt-1">
                      Role: {log.moderator.role}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Target Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Type</span>
                  <Badge variant="outline" className="capitalize">
                    {log.target_type}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Reference</span>
                  <span className="text-sm text-muted-foreground">
                    {log.target_ref}
                  </span>
                </div>
                {log.related_user && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Related User</span>
                    <Badge variant="secondary">
                      {log.related_user.username}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Action Details
                </CardTitle>
                {log.details.reason && (
                  <CardDescription>{log.details.reason}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {log.details.notes && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {log.details.notes}
                    </p>
                  </div>
                )}

                {log.details.duration && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Duration</span>
                    <Badge variant="outline">{log.details.duration} days</Badge>
                  </div>
                )}

                {log.details.previous_state && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Previous State</h4>
                    <pre className="text-sm bg-muted p-2 rounded-md overflow-auto">
                      {JSON.stringify(log.details.previous_state, null, 2)}
                    </pre>
                  </div>
                )}

                {log.details.new_state && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">New State</h4>
                    <pre className="text-sm bg-muted p-2 rounded-md overflow-auto">
                      {JSON.stringify(log.details.new_state, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
