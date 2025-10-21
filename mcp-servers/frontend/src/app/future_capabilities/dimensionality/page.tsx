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
import { DimensionalityModel } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "model_name",
    label: "Model Name",
    type: "text" as const,
    description: "Name of the dimensionality model",
  },
  {
    name: "model_type",
    label: "Model Type",
    type: "select" as const,
    options: [
      { label: "PCA", value: "pca" },
      { label: "t-SNE", value: "tsne" },
      { label: "UMAP", value: "umap" },
      { label: "Autoencoder", value: "autoencoder" },
      { label: "Custom", value: "custom" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Active", value: "active" },
      { label: "Training", value: "training" },
      { label: "Failed", value: "failed" },
      { label: "Archived", value: "archived" },
    ],
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    description: "Detailed description of the model",
  },
  {
    name: "input_dimensions",
    label: "Input Dimensions",
    type: "json" as const,
    description: "Input space dimensionality configuration",
  },
  {
    name: "output_dimensions",
    label: "Output Dimensions",
    type: "json" as const,
    description: "Output space dimensionality configuration",
  },
  {
    name: "model_parameters",
    label: "Model Parameters",
    type: "json" as const,
    description: "Model-specific parameters and settings",
  },
  {
    name: "training_metrics",
    label: "Training Metrics",
    type: "json" as const,
    description: "Model training and performance metrics",
  },
  {
    name: "validation_results",
    label: "Validation Results",
    type: "json" as const,
    description: "Model validation and testing results",
  },
];

export default function DimensionalityPage() {
  const router = useRouter();
  const [data, setData] = React.useState<DimensionalityModel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.dimensionality.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load dimensionality models:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<DimensionalityModel>) {
    try {
      await futureCapabilitiesApi.dimensionality.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create dimensionality model:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dimensionality Models</h2>
          <p className="text-muted-foreground">
            Manage and monitor dimensionality reduction models
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Model
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Dimensionality Model</DialogTitle>
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
              id: "model_type",
              title: "Type",
              options: [
                { label: "PCA", value: "pca" },
                { label: "t-SNE", value: "tsne" },
                { label: "UMAP", value: "umap" },
                { label: "Autoencoder", value: "autoencoder" },
                { label: "Custom", value: "custom" },
              ],
            },
            {
              id: "status",
              title: "Status",
              options: [
                { label: "Active", value: "active" },
                { label: "Training", value: "training" },
                { label: "Failed", value: "failed" },
                { label: "Archived", value: "archived" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "model_name",
              title: "Model Name",
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



