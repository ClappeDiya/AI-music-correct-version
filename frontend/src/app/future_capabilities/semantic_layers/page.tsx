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
import { SemanticLayer } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "layer_name",
    label: "Layer Name",
    type: "text" as const,
    description: "Name of the semantic layer",
  },
  {
    name: "layer_type",
    label: "Layer Type",
    type: "select" as const,
    options: [
      { label: "Ontology", value: "ontology" },
      { label: "Taxonomy", value: "taxonomy" },
      { label: "Knowledge Graph", value: "knowledge_graph" },
      { label: "Semantic Network", value: "semantic_network" },
    ],
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    description: "Detailed description of the semantic layer",
  },
  {
    name: "complexity_level",
    label: "Complexity Level",
    type: "select" as const,
    options: [
      { label: "Basic", value: "basic" },
      { label: "Intermediate", value: "intermediate" },
      { label: "Advanced", value: "advanced" },
      { label: "Expert", value: "expert" },
    ],
  },
  {
    name: "access_mode",
    label: "Access Mode",
    type: "select" as const,
    options: [
      { label: "Read Only", value: "read_only" },
      { label: "Write", value: "write" },
      { label: "Full Access", value: "full_access" },
    ],
  },
  {
    name: "layer_schema",
    label: "Layer Schema",
    type: "json" as const,
    description: "JSON schema definition for the semantic layer",
  },
  {
    name: "validation_rules",
    label: "Validation Rules",
    type: "json" as const,
    description: "Rules for validating semantic relationships",
  },
  {
    name: "integration_points",
    label: "Integration Points",
    type: "json" as const,
    description: "Points of integration with other layers or systems",
  },
];

export default function SemanticLayersPage() {
  const router = useRouter();
  const [data, setData] = React.useState<SemanticLayer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.semanticLayers.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load semantic layers:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<SemanticLayer>) {
    try {
      await futureCapabilitiesApi.semanticLayers.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create semantic layer:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Semantic Layers</h2>
          <p className="text-muted-foreground">
            Manage semantic layers and their relationships
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Layer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Semantic Layer</DialogTitle>
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
              id: "layer_type",
              title: "Layer Type",
              options: [
                { label: "Ontology", value: "ontology" },
                { label: "Taxonomy", value: "taxonomy" },
                { label: "Knowledge Graph", value: "knowledge_graph" },
                { label: "Semantic Network", value: "semantic_network" },
              ],
            },
            {
              id: "complexity_level",
              title: "Complexity",
              options: [
                { label: "Basic", value: "basic" },
                { label: "Intermediate", value: "intermediate" },
                { label: "Advanced", value: "advanced" },
                { label: "Expert", value: "expert" },
              ],
            },
            {
              id: "access_mode",
              title: "Access",
              options: [
                { label: "Read Only", value: "read_only" },
                { label: "Write", value: "write" },
                { label: "Full Access", value: "full_access" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "layer_name",
              title: "Layer Name",
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



