"use client";

import { useEffect, useState } from "react";
import { ReportedContentTable } from "@/components/moderation/ReportedContentTable";
import { useToast } from "@/components/ui/useToast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { AlertCircle, ShieldAlert } from "lucide-react";

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

export default function ModerationPage() {
  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/moderation/reports");
      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setReports(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (
    reportId: string,
    status: string,
    actionNotes?: string,
  ) => {
    try {
      const response = await fetch(`/api/moderation/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          actionNotes,
        }),
      });

      if (!response.ok) throw new Error("Failed to update report status");

      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, status } : report,
        ),
      );

      toast({
        title: "Success",
        description: "Report status has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update report status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async (
    userId: string,
    reason: string,
    duration?: number,
  ) => {
    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
          duration,
        }),
      });

      if (!response.ok) throw new Error("Failed to ban user");

      toast({
        title: "Success",
        description: "User has been banned successfully.",
      });

      // Refresh reports to reflect the changes
      fetchReports();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ban user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const pendingReports = reports.filter(
    (report) => report.status === "pending",
  );
  const reviewedReports = reports.filter(
    (report) => report.status !== "pending",
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6" />
            <CardTitle>Content Moderation</CardTitle>
          </div>
          <CardDescription>
            Review and manage reported content across the platform
          </CardDescription>
        </CardHeader>
      </Card>

      {pendingReports.length > 0 && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            There are {pendingReports.length} reports pending review.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">
            Pending ({pendingReports.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({reviewedReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reports</CardTitle>
              <CardDescription>
                Review and take action on reported content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportedContentTable
                reports={pendingReports}
                onUpdateStatus={handleUpdateStatus}
                onBanUser={handleBanUser}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed">
          <Card>
            <CardHeader>
              <CardTitle>Reviewed Reports</CardTitle>
              <CardDescription>
                History of previously reviewed reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportedContentTable
                reports={reviewedReports}
                onUpdateStatus={handleUpdateStatus}
                onBanUser={handleBanUser}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
