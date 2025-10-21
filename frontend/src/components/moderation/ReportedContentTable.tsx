"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";
import { Alert, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/usetoast";
import { formatDistanceToNow } from "date-fns";

interface ReportedContent {
  id: string;
  type: "post" | "comment" | "profile";
  content: string;
  reportedUser: {
    id: string;
    username: string;
  };
  reporter: {
    id: string;
    username: string;
  };
  reason: string;
  status: "pending" | "reviewed" | "actioned";
  reportedAt: string;
  toxicityScore?: number;
}

interface ReportedContentTableProps {
  reports: ReportedContent[];
  onUpdateStatus: (
    reportId: string,
    status: string,
    actionNotes?: string,
  ) => void;
  onBanUser: (userId: string, reason: string, duration?: number) => void;
}

export function ReportedContentTable({
  reports,
  onUpdateStatus,
  onBanUser,
}: ReportedContentTableProps) {
  const [selectedReport, setSelectedReport] = useState<ReportedContent | null>(
    null,
  );
  const [actionNotes, setActionNotes] = useState("");
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<number>(7); // days
  const { toast } = useToast();

  const handleAction = async (status: "reviewed" | "actioned") => {
    try {
      if (!selectedReport) return;
      await onUpdateStatus(selectedReport.id, status, actionNotes);
      toast({
        title: "Success",
        description: "Report has been processed successfully.",
      });
      setSelectedReport(null);
      setActionNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async () => {
    try {
      if (!selectedReport) return;
      await onBanUser(selectedReport.reportedUser.id, banReason, banDuration);
      toast({
        title: "Success",
        description: "User has been banned successfully.",
      });
      setShowBanDialog(false);
      setBanReason("");
      setSelectedReport(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ban user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Reported User</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reported</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>
                <Badge variant="outline">{report.type}</Badge>
              </TableCell>
              <TableCell>{report.reportedUser.username}</TableCell>
              <TableCell>{report.reporter.username}</TableCell>
              <TableCell className="max-w-xs truncate">
                {report.reason}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    report.status === "pending"
                      ? "secondary"
                      : report.status === "actioned"
                        ? "destructive"
                        : "default"
                  }
                >
                  {report.status}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(report.reportedAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                {report.toxicityScore && (
                  <Badge
                    variant={
                      report.toxicityScore > 0.8
                        ? "destructive"
                        : report.toxicityScore > 0.5
                          ? "warning"
                          : "default"
                    }
                  >
                    {Math.round(report.toxicityScore * 100)}%
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReport(report)}
                  >
                    Review
                  </Button>
                  {report.status === "pending" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setShowBanDialog(true);
                      }}
                    >
                      Ban User
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!selectedReport && !showBanDialog}
        onOpenChange={() => setSelectedReport(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Reported Content</DialogTitle>
            <DialogDescription>
              Review the reported content and take appropriate action.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h4 className="font-medium mb-2">Reported Content:</h4>
              <p className="text-sm">{selectedReport?.content}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Action Notes:</label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Enter notes about the action taken..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleAction("reviewed")}
            >
              Mark as Reviewed
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAction("actioned")}
            >
              Take Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Specify the reason and duration for banning the user.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Ban Reason:</label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter the reason for banning..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Ban Duration (days):
              </label>
              <input
                type="number"
                value={banDuration}
                onChange={(e) => setBanDuration(Number(e.target.value))}
                min={1}
                className="mt-1 w-full rounded-md border border-input px-3 py-2"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBanUser}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
