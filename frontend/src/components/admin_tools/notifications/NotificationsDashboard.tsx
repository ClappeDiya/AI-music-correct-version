import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  FileText,
  Scale,
  Shield,
  ArrowUpRight,
  Eye,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  notificationsApi,
  Notification,
  EscalationRequest,
  NotificationPriority,
} from "@/services/admin_tools/notifications";
import { useToast } from "@/components/ui/useToast";

const priorityColors: Record<NotificationPriority, string> = {
  low: "bg-blue-500/20 text-blue-700",
  medium: "bg-yellow-500/20 text-yellow-700",
  high: "bg-orange-500/20 text-orange-700",
  critical: "bg-red-500/20 text-red-700",
};

const priorityIcons: Record<NotificationPriority, any> = {
  low: Bell,
  medium: AlertCircle,
  high: AlertTriangle,
  critical: Scale,
};

export function NotificationsDashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [escalations, setEscalations] = useState<EscalationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [selectedEscalation, setSelectedEscalation] =
    useState<EscalationRequest | null>(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [escalationDialogOpen, setEscalationDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notificationsData, escalationsData] = await Promise.all([
        notificationsApi.getNotifications(),
        notificationsApi.getEscalations(),
      ]);
      setNotifications(notificationsData.results);
      setEscalations(escalationsData.results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await notificationsApi.markAsRead(notification.id);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEscalation = async (
    escalationId: string,
    status: EscalationRequest["status"],
    notes?: string,
  ) => {
    try {
      await notificationsApi.updateEscalation(escalationId, {
        status,
        resolution_notes: notes,
      });
      toast({ title: "Escalation updated successfully" });
      setEscalationDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update escalation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Notifications & Escalations
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage notifications and handle escalation requests
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Unread Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {notifications.filter((n) => !n.read_at).length}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Pending Escalations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {escalations.filter((e) => e.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {notifications.filter((n) => n.priority === "critical").length +
                escalations.filter((e) => e.priority === "critical").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-card">
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none p-0">
            <TabsTrigger
              value="notifications"
              className="flex-1 sm:flex-none data-[state=active]:rounded-none"
            >
              <Bell className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="escalations"
              className="flex-1 sm:flex-none data-[state=active]:rounded-none"
            >
              <Shield className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Escalations</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="notifications" className="m-0">
              <div className="rounded-md border">
                <DataTable
                  columns={[
                    {
                      accessorKey: "priority",
                      header: "Priority",
                      cell: ({ row }) => {
                        const Icon = priorityIcons[row.original.priority];
                        return (
                          <Badge
                            className={`${
                              priorityColors[row.original.priority]
                            } flex items-center gap-1 whitespace-nowrap`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              {row.original.priority.charAt(0).toUpperCase() +
                                row.original.priority.slice(1)}
                            </span>
                          </Badge>
                        );
                      },
                    },
                    {
                      accessorKey: "title",
                      header: "Title",
                      cell: ({ row }) => (
                        <div
                          className={`font-medium truncate max-w-[200px] sm:max-w-none ${
                            !row.original.read_at
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {row.original.title}
                        </div>
                      ),
                    },
                    {
                      accessorKey: "created_at",
                      header: "Time",
                      cell: ({ row }) => (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                          <Clock className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {format(new Date(row.original.created_at), "PPp")}
                          </span>
                          <span className="sm:hidden">
                            {format(new Date(row.original.created_at), "PP")}
                          </span>
                        </div>
                      ),
                    },
                    {
                      id: "actions",
                      cell: ({ row }) => (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedNotification(row.original);
                              setNotificationDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!row.original.read_at && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsRead(row.original)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ),
                    },
                  ]}
                  data={notifications}
                  pagination
                />
              </div>
            </TabsContent>

            <TabsContent value="escalations" className="m-0">
              <div className="rounded-md border">
                <DataTable
                  columns={[
                    {
                      accessorKey: "priority",
                      header: "Priority",
                      cell: ({ row }) => {
                        const Icon = priorityIcons[row.original.priority];
                        return (
                          <Badge
                            className={`${
                              priorityColors[row.original.priority]
                            } flex items-center gap-1 whitespace-nowrap`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              {row.original.priority.charAt(0).toUpperCase() +
                                row.original.priority.slice(1)}
                            </span>
                          </Badge>
                        );
                      },
                    },
                    {
                      accessorKey: "title",
                      header: "Title",
                      cell: ({ row }) => (
                        <div className="font-medium truncate max-w-[200px] sm:max-w-none">
                          {row.original.title}
                        </div>
                      ),
                    },
                    {
                      accessorKey: "status",
                      header: "Status",
                      cell: ({ row }) => {
                        const statusColors = {
                          pending: "bg-yellow-500/20 text-yellow-700",
                          in_review: "bg-blue-500/20 text-blue-700",
                          resolved: "bg-green-500/20 text-green-700",
                          rejected: "bg-red-500/20 text-red-700",
                        };
                        return (
                          <Badge
                            className={`${statusColors[row.original.status]} whitespace-nowrap`}
                          >
                            {row.original.status
                              .replace("_", " ")
                              .toUpperCase()}
                          </Badge>
                        );
                      },
                    },
                    {
                      accessorKey: "created_by.username",
                      header: "Created By",
                      cell: ({ row }) => (
                        <div className="flex items-center gap-2 truncate max-w-[150px] sm:max-w-none">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {row.original.created_by.username}
                          </span>
                        </div>
                      ),
                    },
                    {
                      id: "actions",
                      cell: ({ row }) => (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedEscalation(row.original);
                            setEscalationDialogOpen(true);
                          }}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      ),
                    },
                  ]}
                  data={escalations}
                  pagination
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <Dialog
        open={notificationDialogOpen}
        onOpenChange={setNotificationDialogOpen}
      >
        <DialogContent className="max-w-lg w-[90vw] sm:w-full max-h-[90vh] flex flex-col">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification && (
                <>
                  {priorityIcons[selectedNotification.priority] && (
                    <div
                      className={priorityColors[selectedNotification.priority]}
                    >
                      {priorityIcons[selectedNotification.priority]({
                        className: "h-5 w-5",
                      })}
                    </div>
                  )}
                  Notification Details
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedNotification && (
            <ScrollArea className="flex-1">
              <div className="space-y-6 p-1">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Message</h4>
                    <div className="text-sm bg-muted p-3 rounded-md">
                      {selectedNotification.message}
                    </div>
                  </div>

                  {selectedNotification.metadata && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">
                        Additional Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(selectedNotification.metadata).map(
                          ([key, value]) => (
                            <Card key={key} className="overflow-hidden">
                              <CardHeader className="p-3">
                                <CardTitle className="text-sm capitalize">
                                  {key.replace(/_/g, " ")}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 pt-0">
                                <div className="text-sm break-all">
                                  {typeof value === "object"
                                    ? JSON.stringify(value, null, 2)
                                    : String(value)}
                                </div>
                              </CardContent>
                            </Card>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {format(
                        new Date(selectedNotification.created_at),
                        "PPpp",
                      )}
                    </div>
                    {selectedNotification.read_at && (
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Read at:{" "}
                        {format(new Date(selectedNotification.read_at), "PPpp")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={escalationDialogOpen}
        onOpenChange={setEscalationDialogOpen}
      >
        <DialogContent className="max-w-2xl w-[90vw] sm:w-full max-h-[90vh] flex flex-col">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2">
              {selectedEscalation && (
                <>
                  {priorityIcons[selectedEscalation.priority] && (
                    <div
                      className={priorityColors[selectedEscalation.priority]}
                    >
                      {priorityIcons[selectedEscalation.priority]({
                        className: "h-5 w-5",
                      })}
                    </div>
                  )}
                  Escalation Details
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Review and manage escalation request
            </DialogDescription>
          </DialogHeader>

          {selectedEscalation && (
            <ScrollArea className="flex-1">
              <div className="space-y-6 p-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        className={`
                          ${selectedEscalation.status === "pending" && "bg-yellow-500/20 text-yellow-700"}
                          ${selectedEscalation.status === "in_review" && "bg-blue-500/20 text-blue-700"}
                          ${selectedEscalation.status === "resolved" && "bg-green-500/20 text-green-700"}
                          ${selectedEscalation.status === "rejected" && "bg-red-500/20 text-red-700"}
                        `}
                      >
                        {selectedEscalation.status
                          .replace("_", " ")
                          .toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Created By
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div className="text-sm">
                        <div>{selectedEscalation.created_by.username}</div>
                        <div className="text-muted-foreground">
                          {selectedEscalation.created_by.role}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <div className="text-sm bg-muted p-3 rounded-md">
                      {selectedEscalation.description}
                    </div>
                  </div>

                  {selectedEscalation.metadata && (
                    <div className="space-y-4">
                      {selectedEscalation.metadata.evidence && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Evidence</h4>
                          <div className="space-y-2">
                            {selectedEscalation.metadata.evidence.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  className="p-3 bg-muted rounded-md text-sm break-all"
                                >
                                  {item}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {selectedEscalation.metadata.legal_references && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Legal References
                          </h4>
                          <div className="space-y-2">
                            {selectedEscalation.metadata.legal_references.map(
                              (ref, index) => (
                                <div
                                  key={index}
                                  className="p-3 bg-muted rounded-md text-sm break-all"
                                >
                                  {ref}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedEscalation.status !== "resolved" &&
                    selectedEscalation.status !== "rejected" && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleUpdateEscalation(
                            selectedEscalation.id,
                            formData.get(
                              "status",
                            ) as EscalationRequest["status"],
                            formData.get("notes") as string,
                          );
                        }}
                        className="space-y-4 pt-4 border-t"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Update Status
                          </label>
                          <Select name="status" required>
                            <SelectTrigger className="w-full sm:w-[200px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in_review">
                                In Review
                              </SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Notes</label>
                          <Textarea
                            name="notes"
                            placeholder="Add resolution notes..."
                            className="min-h-[100px]"
                          />
                        </div>

                        <DialogFooter className="sm:space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEscalationDialogOpen(false)}
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" className="w-full sm:w-auto">
                            Update Escalation
                          </Button>
                        </DialogFooter>
                      </form>
                    )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
