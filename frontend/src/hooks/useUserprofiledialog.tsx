import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, Clock, Activity, Flag, History } from "lucide-react";
import { userManagementApi } from "@/services/admin_tools/user-management";

interface UserProfileDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({
  userId,
  open,
  onOpenChange,
}: UserProfileDialogProps) {
  const [profile, setProfile] = useState<any>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && userId) {
      loadUserData();
    }
  }, [open, userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [profileData, violationsData, activityData] = await Promise.all([
        userManagementApi.getUserProfile(userId),
        userManagementApi.getViolationHistory(userId),
        userManagementApi.getActivitySummary(userId),
      ]);
      setProfile(profileData);
      setViolations(violationsData.results);
      setActivity(activityData.results);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile || loading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>User Profile: {profile.username}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Violations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                {profile.violation_count}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Open Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{profile.open_reports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last Active
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-sm">
                {new Date(profile.last_active).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activity" className="flex-1">
          <TabsList>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="violations">Violation History</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="activity" className="space-y-4">
              {activity.map((item, index) => (
                <Card key={index}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        {item.type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </CardTitle>
                    <CardDescription>{item.content_ref}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="violations" className="space-y-4">
              {violations.map((violation, index) => (
                <Card key={index}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        {violation.type}
                      </span>
                      <Badge variant="outline">{violation.status}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {violation.description}
                      <div className="text-sm text-muted-foreground mt-2">
                        {new Date(violation.date).toLocaleString()}
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
