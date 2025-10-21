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
import { MicroserviceRegistry } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "service_name",
    label: "Service Name",
    type: "text" as const,
    description: "Name of the microservice",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    description: "Detailed description of the microservice",
  },
  {
    name: "version",
    label: "Version",
    type: "text" as const,
    description: "Current version of the microservice",
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Deprecated", value: "deprecated" },
      { label: "Development", value: "development" },
    ],
  },
  {
    name: "security_classification",
    label: "Security Classification",
    type: "select" as const,
    options: [
      { label: "Public", value: "public" },
      { label: "Internal", value: "internal" },
      { label: "Confidential", value: "confidential" },
      { label: "Restricted", value: "restricted" },
    ],
  },
  {
    name: "endpoints",
    label: "Endpoints",
    type: "json" as const,
    description: "List of service endpoints and their configurations",
  },
  {
    name: "dependencies",
    label: "Dependencies",
    type: "json" as const,
    description: "List of service dependencies",
  },
  {
    name: "performance_metrics",
    label: "Performance Metrics",
    type: "json" as const,
    description: "Service performance metrics and thresholds",
  },
  {
    name: "deployment_config",
    label: "Deployment Configuration",
    type: "json" as const,
    description: "Service deployment configuration",
  },
];

export default function MicroservicesPage() {
  const router = useRouter();
  const [data, setData] = React.useState<MicroserviceRegistry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.microservices.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load microservices:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<MicroserviceRegistry>) {
    try {
      await futureCapabilitiesApi.microservices.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create microservice:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Microservices</h2>
          <p className="text-muted-foreground">
            Manage microservices and their configurations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Microservice</DialogTitle>
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
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Deprecated", value: "deprecated" },
                { label: "Development", value: "development" },
              ],
            },
            {
              id: "security_classification",
              title: "Security",
              options: [
                { label: "Public", value: "public" },
                { label: "Internal", value: "internal" },
                { label: "Confidential", value: "confidential" },
                { label: "Restricted", value: "restricted" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "service_name",
              title: "Service Name",
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



