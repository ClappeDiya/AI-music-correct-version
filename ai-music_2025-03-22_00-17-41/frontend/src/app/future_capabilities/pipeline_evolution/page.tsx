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
import { PipelineEvolution } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "pipeline_id",
    label: "Pipeline ID",
    type: "text" as const,
    description: "Unique identifier for the pipeline",
  },
  {
    name: "evolution_type",
    label: "Evolution Type",
    type: "select" as const,
    options: [
      { label: "Architecture Change", value: "architecture" },
      { label: "Parameter Update", value: "parameter" },
      { label: "Performance Optimization", value: "optimization" },
      { label: "Error Recovery", value: "error_recovery" },
      { label: "Feature Addition", value: "feature" },
      { label: "Security Update", value: "security" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Completed", value: "completed" },
      { label: "In Progress", value: "in_progress" },
      { label: "Failed", value: "failed" },
      { label: "Rolled Back", value: "rolled_back" },
    ],
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    description: "Detailed description of the evolution",
  },
  {
    name: "changes",
    label: "Changes",
    type: "json" as const,
    description: "Detailed changes made to the pipeline",
  },
  {
    name: "performance_impact",
    label: "Performance Impact",
    type: "json" as const,
    description: "Impact on pipeline performance metrics",
  },
  {
    name: "dependencies",
    label: "Dependencies",
    type: "json" as const,
    description: "Affected dependencies and components",
  },
  {
    name: "validation_results",
    label: "Validation Results",
    type: "json" as const,
    description: "Evolution validation results",
  },
  {
    name: "rollback_plan",
    label: "Rollback Plan",
    type: "json" as const,
    description: "Plan for reverting changes if needed",
  },
];

export default function PipelineEvolutionPage() {
  const router = useRouter();
  const [data, setData] = React.useState<PipelineEvolution[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.pipelineEvolution.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load pipeline evolution logs:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<PipelineEvolution>) {
    try {
      await futureCapabilitiesApi.pipelineEvolution.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create pipeline evolution log:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pipeline Evolution</h2>
          <p className="text-muted-foreground">
            Track and manage pipeline evolutionary changes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Log Evolution
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Evolution Log</DialogTitle>
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
              id: "evolution_type",
              title: "Type",
              options: [
                { label: "Architecture Change", value: "architecture" },
                { label: "Parameter Update", value: "parameter" },
                { label: "Performance Optimization", value: "optimization" },
                { label: "Error Recovery", value: "error_recovery" },
                { label: "Feature Addition", value: "feature" },
                { label: "Security Update", value: "security" },
              ],
            },
            {
              id: "status",
              title: "Status",
              options: [
                { label: "Completed", value: "completed" },
                { label: "In Progress", value: "in_progress" },
                { label: "Failed", value: "failed" },
                { label: "Rolled Back", value: "rolled_back" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "pipeline_id",
              title: "Pipeline ID",
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



