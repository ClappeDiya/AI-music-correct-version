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
import { ThirdPartyIntegration } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "integration_name",
    label: "Integration Name",
    type: "text" as const,
    description: "Name of the third-party integration",
  },
  {
    name: "provider",
    label: "Provider",
    type: "text" as const,
    description: "Name of the service provider",
  },
  {
    name: "integration_type",
    label: "Integration Type",
    type: "select" as const,
    options: [
      { label: "Authentication", value: "authentication" },
      { label: "Storage", value: "storage" },
      { label: "Analytics", value: "analytics" },
      { label: "Payment", value: "payment" },
      { label: "Communication", value: "communication" },
      { label: "AI Service", value: "ai_service" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Error", value: "error" },
      { label: "Pending", value: "pending" },
    ],
  },
  {
    name: "api_configuration",
    label: "API Configuration",
    type: "json" as const,
    description: "API endpoints and authentication details",
  },
  {
    name: "data_mapping",
    label: "Data Mapping",
    type: "json" as const,
    description: "Data field mappings between systems",
  },
  {
    name: "permissions",
    label: "Permissions",
    type: "json" as const,
    description: "Integration permissions and scopes",
  },
  {
    name: "sync_settings",
    label: "Sync Settings",
    type: "json" as const,
    description: "Data synchronization settings",
  },
];

export default function ThirdPartyIntegrationsPage() {
  const router = useRouter();
  const [data, setData] = React.useState<ThirdPartyIntegration[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.thirdParty.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load integrations:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<ThirdPartyIntegration>) {
    try {
      await futureCapabilitiesApi.thirdParty.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create integration:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Third Party Integrations</h2>
          <p className="text-muted-foreground">
            Manage external service integrations and configurations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Integration</DialogTitle>
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
              id: "integration_type",
              title: "Type",
              options: [
                { label: "Authentication", value: "authentication" },
                { label: "Storage", value: "storage" },
                { label: "Analytics", value: "analytics" },
                { label: "Payment", value: "payment" },
                { label: "Communication", value: "communication" },
                { label: "AI Service", value: "ai_service" },
              ],
            },
            {
              id: "status",
              title: "Status",
              options: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Error", value: "error" },
                { label: "Pending", value: "pending" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "integration_name",
              title: "Integration Name",
            },
            {
              id: "provider",
              title: "Provider",
            },
          ]}
        />
      </div>
    </Layout>
  );
}



