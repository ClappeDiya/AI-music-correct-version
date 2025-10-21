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
import { MiniAppRegistry } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "app_name",
    label: "App Name",
    type: "text" as const,
    description: "Name of the mini app",
  },
  {
    name: "version",
    label: "Version",
    type: "text" as const,
    description: "Version number (semver)",
  },
  {
    name: "app_type",
    label: "App Type",
    type: "select" as const,
    options: [
      { label: "Visualization", value: "visualization" },
      { label: "Audio Effect", value: "audio_effect" },
      { label: "Instrument", value: "instrument" },
      { label: "Analysis", value: "analysis" },
      { label: "Utility", value: "utility" },
      { label: "Game", value: "game" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Development", value: "development" },
      { label: "Deprecated", value: "deprecated" },
    ],
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    description: "Detailed description of the mini app",
  },
  {
    name: "entry_points",
    label: "Entry Points",
    type: "json" as const,
    description: "App entry points and routes",
  },
  {
    name: "dependencies",
    label: "Dependencies",
    type: "json" as const,
    description: "Required dependencies and versions",
  },
  {
    name: "permissions",
    label: "Permissions",
    type: "json" as const,
    description: "Required app permissions",
  },
  {
    name: "configuration",
    label: "Configuration",
    type: "json" as const,
    description: "App configuration settings",
  },
];

export default function MiniAppsPage() {
  const router = useRouter();
  const [data, setData] = React.useState<MiniAppRegistry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.miniApps.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load mini apps:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<MiniAppRegistry>) {
    try {
      await futureCapabilitiesApi.miniApps.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create mini app:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mini Apps</h2>
          <p className="text-muted-foreground">
            Manage and configure mini applications
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create App
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Mini App</DialogTitle>
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
              id: "app_type",
              title: "Type",
              options: [
                { label: "Visualization", value: "visualization" },
                { label: "Audio Effect", value: "audio_effect" },
                { label: "Instrument", value: "instrument" },
                { label: "Analysis", value: "analysis" },
                { label: "Utility", value: "utility" },
                { label: "Game", value: "game" },
              ],
            },
            {
              id: "status",
              title: "Status",
              options: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Development", value: "development" },
                { label: "Deprecated", value: "deprecated" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "app_name",
              title: "App Name",
            },
            {
              id: "description",
              title: "Description",
            },
          ]}
        />
      </div>
    </Layout>
  );
}



