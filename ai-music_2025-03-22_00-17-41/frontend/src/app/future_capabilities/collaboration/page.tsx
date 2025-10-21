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
import { CollaborationSession } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "session_name",
    label: "Session Name",
    type: "text" as const,
    description: "Name of the collaboration session",
  },
  {
    name: "participant_user_ids",
    label: "Participant User IDs",
    type: "json" as const,
    description: "Array of user IDs who can participate in this session",
  },
  {
    name: "moderators",
    label: "Moderators",
    type: "json" as const,
    description: "Array of user IDs who can moderate this session",
  },
  {
    name: "session_config",
    label: "Session Configuration",
    type: "json" as const,
    description: "Configuration settings for the session",
  },
  {
    name: "active",
    label: "Active",
    type: "select" as const,
    options: [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
  },
];

export default function CollaborationSessionPage() {
  const router = useRouter();
  const [data, setData] = React.useState<CollaborationSession[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.collaborationSessions.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load collaboration sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<CollaborationSession>) {
    try {
      await futureCapabilitiesApi.collaborationSessions.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create collaboration session:", error);
    }
  }

  async function handleActivate(id: string) {
    try {
      await futureCapabilitiesApi.collaborationSessions.activate(id);
      loadData();
    } catch (error) {
      console.error("Failed to activate session:", error);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await futureCapabilitiesApi.collaborationSessions.deactivate(id);
      loadData();
    } catch (error) {
      console.error("Failed to deactivate session:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Collaboration Sessions
          </h2>
          <p className="text-muted-foreground">
            Manage your collaboration sessions and participants
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collaboration Session</DialogTitle>
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
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          filterableColumns={[
            {
              id: "active",
              title: "Status",
              options: [
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "session_name",
              title: "Session Name",
            },
          ]}
        />
      </div>
    </Layout>
  );
}



