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
import { SynestheticMapping } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "mapping_name",
    label: "Mapping Name",
    type: "text" as const,
    description: "Name of the synesthetic mapping",
  },
  {
    name: "mapping_type",
    label: "Mapping Type",
    type: "select" as const,
    options: [
      { label: "Sound to Color", value: "sound_color" },
      { label: "Color to Sound", value: "color_sound" },
      { label: "Motion to Sound", value: "motion_sound" },
      { label: "Sound to Texture", value: "sound_texture" },
      { label: "Emotion to Sound", value: "emotion_sound" },
      { label: "Custom", value: "custom" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Testing", value: "testing" },
      { label: "Archived", value: "archived" },
    ],
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    description: "Detailed description of the mapping",
  },
  {
    name: "input_modality",
    label: "Input Modality",
    type: "json" as const,
    description: "Input sensory modality configuration",
  },
  {
    name: "output_modality",
    label: "Output Modality",
    type: "json" as const,
    description: "Output sensory modality configuration",
  },
  {
    name: "mapping_rules",
    label: "Mapping Rules",
    type: "json" as const,
    description: "Rules and transformations for the mapping",
  },
  {
    name: "neural_correlates",
    label: "Neural Correlates",
    type: "json" as const,
    description: "Associated neural patterns and pathways",
  },
  {
    name: "validation_metrics",
    label: "Validation Metrics",
    type: "json" as const,
    description: "Mapping validation and effectiveness metrics",
  },
];

export default function SynestheticPage() {
  const router = useRouter();
  const [data, setData] = React.useState<SynestheticMapping[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.synesthetic.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load synesthetic mappings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<SynestheticMapping>) {
    try {
      await futureCapabilitiesApi.synesthetic.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create synesthetic mapping:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Synesthetic Mappings</h2>
          <p className="text-muted-foreground">
            Manage cross-modal sensory mappings and transformations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Mapping
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Synesthetic Mapping</DialogTitle>
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
              id: "mapping_type",
              title: "Type",
              options: [
                { label: "Sound to Color", value: "sound_color" },
                { label: "Color to Sound", value: "color_sound" },
                { label: "Motion to Sound", value: "motion_sound" },
                { label: "Sound to Texture", value: "sound_texture" },
                { label: "Emotion to Sound", value: "emotion_sound" },
                { label: "Custom", value: "custom" },
              ],
            },
            {
              id: "status",
              title: "Status",
              options: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Testing", value: "testing" },
                { label: "Archived", value: "archived" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "mapping_name",
              title: "Mapping Name",
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



