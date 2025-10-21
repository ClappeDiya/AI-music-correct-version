"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Layout } from '@/components/future_capabilities/layout";
import { DataTable } from '@/components/future_capabilities/data_table";
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { DataForm } from '@/components/future_capabilities/data_form";
import { futureCapabilitiesApi } from '@/lib/api/future_capabilities";
import { CollaborationActivityLog } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "session",
    label: "Session ID",
    type: "text" as const,
    description: "ID of the collaboration session",
  },
  {
    name: "user_id",
    label: "User ID",
    type: "text" as const,
    description: "ID of the user performing the action",
  },
  {
    name: "action_type",
    label: "Action Type",
    type: "select" as const,
    options: [
      { label: "Join", value: "join" },
      { label: "Leave", value: "leave" },
      { label: "Message", value: "message" },
      { label: "Edit", value: "edit" },
      { label: "Share", value: "share" },
      { label: "Control", value: "control" },
    ],
  },
  {
    name: "action_detail",
    label: "Action Detail",
    type: "textarea" as const,
    description: "Detailed description of the action",
  },
  {
    name: "timestamp",
    label: "Timestamp",
    type: "text" as const,
    description: "Timestamp of the action (ISO format)",
  },
  {
    name: "metadata",
    label: "Metadata",
    type: "json" as const,
    description: "Additional metadata about the action",
  },
];

export default function CollaborationActivityPage() {
  const router = useRouter();
  const [data, setData] = React.useState<CollaborationActivityLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.collaborationActivity.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load activity logs:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<CollaborationActivityLog>) {
    try {
      await futureCapabilitiesApi.collaborationActivity.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create activity log:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Activity Logs</h2>
          <p className="text-muted-foreground">
            Track all collaboration session activities
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Log Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Activity</DialogTitle>
            </DialogHeader>
            <DataForm
              schema={formSchema}
              fields={formFields}
              onSubmit={handleCreate}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="p-4">
        <DataTable
          columns={columns}
          data={data}
          filterableColumns={[
            {
              id: "action_type",
              title: "Action Type",
              options: [
                { label: "Join", value: "join" },
                { label: "Leave", value: "leave" },
                { label: "Message", value: "message" },
                { label: "Edit", value: "edit" },
                { label: "Share", value: "share" },
                { label: "Control", value: "control" },
              ],
            },
            {
              id: "user_id",
              title: "User",
            },
            {
              id: "session",
              title: "Session",
            },
          ]}
          searchableColumns={[
            {
              id: "action_detail",
              title: "Action Detail",
            },
          ]}
        />
      </div>
    </Layout>
  );
}



