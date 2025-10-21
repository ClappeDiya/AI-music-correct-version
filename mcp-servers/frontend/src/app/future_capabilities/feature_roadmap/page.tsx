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
import { FeatureRoadmap } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "feature_name",
    label: "Feature Name",
    type: "text" as const,
    description: "Name of the feature",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    description: "Detailed description of the feature",
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Planned", value: "planned" },
      { label: "In Progress", value: "in_progress" },
      { label: "Completed", value: "completed" },
      { label: "On Hold", value: "on_hold" },
    ],
  },
  {
    name: "priority_level",
    label: "Priority Level",
    type: "select" as const,
    options: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
      { label: "Critical", value: "critical" },
    ],
  },
  {
    name: "target_release_date",
    label: "Target Release Date",
    type: "text" as const,
    description: "Expected release date (YYYY-MM-DD)",
  },
  {
    name: "visibility",
    label: "Visibility",
    type: "select" as const,
    options: [
      { label: "Public", value: "public" },
      { label: "Internal", value: "internal" },
      { label: "Confidential", value: "confidential" },
    ],
  },
  {
    name: "technical_requirements",
    label: "Technical Requirements",
    type: "json" as const,
    description: "Technical specifications and requirements",
  },
  {
    name: "dependencies",
    label: "Dependencies",
    type: "json" as const,
    description: "List of dependent features or components",
  },
];

export default function FeatureRoadmapPage() {
  const router = useRouter();
  const [data, setData] = React.useState<FeatureRoadmap[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.featureRoadmap.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load feature roadmap:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<FeatureRoadmap>) {
    try {
      await futureCapabilitiesApi.featureRoadmap.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create feature:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Feature Roadmap</h2>
          <p className="text-muted-foreground">
            Track and manage upcoming features and their progress
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Feature
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Feature</DialogTitle>
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
              id: "status",
              title: "Status",
              options: [
                { label: "Planned", value: "planned" },
                { label: "In Progress", value: "in_progress" },
                { label: "Completed", value: "completed" },
                { label: "On Hold", value: "on_hold" },
              ],
            },
            {
              id: "priority_level",
              title: "Priority",
              options: [
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
                { label: "Critical", value: "critical" },
              ],
            },
            {
              id: "visibility",
              title: "Visibility",
              options: [
                { label: "Public", value: "public" },
                { label: "Internal", value: "internal" },
                { label: "Confidential", value: "confidential" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "feature_name",
              title: "Feature Name",
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



