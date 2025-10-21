import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Shield, AlertTriangle, FileText, Users, Activity } from "lucide-react";
import { ModerationQueue } from "./moderation-queue";
import { ReportsList } from "./reports-list";
import { ActionHistory } from "./action-history";

export function AdminToolsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Tools</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reports
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        {/* Add more stat cards */}
      </div>

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="actions">Action History</TabsTrigger>
          <TabsTrigger value="rules">Rules & Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="queue">
          <ModerationQueue />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsList />
        </TabsContent>
        <TabsContent value="actions">
          <ActionHistory />
        </TabsContent>
        <TabsContent value="rules">
          {/* Add Rules & Templates component */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
