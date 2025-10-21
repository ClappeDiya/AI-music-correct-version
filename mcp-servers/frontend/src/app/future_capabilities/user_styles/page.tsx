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
import { UserStyleProfile } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "user_id",
    label: "User ID",
    type: "text" as const,
    description: "ID of the user",
  },
  {
    name: "profile_name",
    label: "Profile Name",
    type: "text" as const,
    description: "Name of the style profile",
  },
  {
    name: "style_type",
    label: "Style Type",
    type: "select" as const,
    options: [
      { label: "Classical", value: "classical" },
      { label: "Jazz", value: "jazz" },
      { label: "Electronic", value: "electronic" },
      { label: "Rock", value: "rock" },
      { label: "Custom", value: "custom" },
    ],
  },
  {
    name: "preferences",
    label: "Preferences",
    type: "json" as const,
    description: "User's musical preferences",
  },
  {
    name: "instrument_settings",
    label: "Instrument Settings",
    type: "json" as const,
    description: "Preferred instrument settings",
  },
  {
    name: "visualization_settings",
    label: "Visualization Settings",
    type: "json" as const,
    description: "Visual style preferences",
  },
  {
    name: "is_active",
    label: "Active",
    type: "checkbox" as const,
    description: "Whether this profile is currently active",
  },
  {
    name: "learning_parameters",
    label: "Learning Parameters",
    type: "json" as const,
    description: "AI learning parameters for style adaptation",
  },
];

export default function UserStylesPage() {
  const router = useRouter();
  const [data, setData] = React.useState<UserStyleProfile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.userStyles.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load style profiles:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<UserStyleProfile>) {
    try {
      await futureCapabilitiesApi.userStyles.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create style profile:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Style Profiles</h2>
          <p className="text-muted-foreground">
            Manage user musical style preferences and settings
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Style Profile</DialogTitle>
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
              id: "style_type",
              title: "Style",
              options: [
                { label: "Classical", value: "classical" },
                { label: "Jazz", value: "jazz" },
                { label: "Electronic", value: "electronic" },
                { label: "Rock", value: "rock" },
                { label: "Custom", value: "custom" },
              ],
            },
            {
              id: "is_active",
              title: "Status",
              options: [
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "profile_name",
              title: "Profile Name",
            },
            {
              id: "user_id",
              title: "User ID",
            },
          ]}
        />
      </div>
    </Layout>
  );
}



