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
import { VREnvironmentConfig } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "environment_name",
    label: "Environment Name",
    type: "text" as const,
    description: "Name of the VR environment",
  },
  {
    name: "spatial_audio_settings",
    label: "Spatial Audio Settings",
    type: "json" as const,
    description: "JSON settings for spatial audio nodes and reverb parameters",
  },
  {
    name: "haptic_profiles",
    label: "Haptic Profiles",
    type: "json" as const,
    description: "JSON profiles for haptic feedback intensity mappings",
  },
  {
    name: "interactive_3d_instruments",
    label: "Interactive 3D Instruments",
    type: "json" as const,
    description: "JSON configurations for interactive 3D instruments",
  },
  {
    name: "access_level",
    label: "Access Level",
    type: "select" as const,
    options: [
      { label: "Public", value: "public" },
      { label: "Private", value: "private" },
      { label: "Shared", value: "shared" },
    ],
  },
];

export default function VREnvironmentsPage() {
  const router = useRouter();
  const [data, setData] = React.useState<VREnvironmentConfig[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.vrEnvironments.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load VR environments:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<VREnvironmentConfig>) {
    try {
      await futureCapabilitiesApi.vrEnvironments.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create VR environment:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">VR Environments</h2>
          <p className="text-muted-foreground">
            Manage your VR environment configurations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Environment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create VR Environment</DialogTitle>
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
              id: "access_level",
              title: "Access Level",
              options: [
                { label: "Public", value: "public" },
                { label: "Private", value: "private" },
                { label: "Shared", value: "shared" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "environment_name",
              title: "Environment Name",
            },
          ]}
        />
      </div>
    </Layout>
  );
}



