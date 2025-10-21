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
import { AIPartnership } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "partner_name",
    label: "Partner Name",
    type: "text" as const,
    description: "Name of the AI agent partner",
  },
  {
    name: "partnership_type",
    label: "Partnership Type",
    type: "select" as const,
    options: [
      { label: "Research", value: "research" },
      { label: "Commercial", value: "commercial" },
      { label: "Open Source", value: "open_source" },
      { label: "Educational", value: "educational" },
      { label: "Government", value: "government" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Active", value: "active" },
      { label: "Pending", value: "pending" },
      { label: "Suspended", value: "suspended" },
      { label: "Terminated", value: "terminated" },
    ],
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    description: "Detailed description of the partnership",
  },
  {
    name: "capabilities",
    label: "Capabilities",
    type: "json" as const,
    description: "AI agent capabilities and specializations",
  },
  {
    name: "integration_details",
    label: "Integration Details",
    type: "json" as const,
    description: "Technical integration specifications",
  },
  {
    name: "performance_metrics",
    label: "Performance Metrics",
    type: "json" as const,
    description: "Partnership performance and success metrics",
  },
  {
    name: "compliance_info",
    label: "Compliance Information",
    type: "json" as const,
    description: "Regulatory and compliance details",
  },
  {
    name: "resource_allocation",
    label: "Resource Allocation",
    type: "json" as const,
    description: "Resource sharing and allocation details",
  },
];

export default function AIPartnershipsPage() {
  const router = useRouter();
  const [data, setData] = React.useState<AIPartnership[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.aiPartnerships.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load AI partnerships:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<AIPartnership>) {
    try {
      await futureCapabilitiesApi.aiPartnerships.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create AI partnership:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Agent Partnerships</h2>
          <p className="text-muted-foreground">
            Manage partnerships with AI agents and organizations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Partnership
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create AI Partnership</DialogTitle>
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
              id: "partnership_type",
              title: "Type",
              options: [
                { label: "Research", value: "research" },
                { label: "Commercial", value: "commercial" },
                { label: "Open Source", value: "open_source" },
                { label: "Educational", value: "educational" },
                { label: "Government", value: "government" },
              ],
            },
            {
              id: "status",
              title: "Status",
              options: [
                { label: "Active", value: "active" },
                { label: "Pending", value: "pending" },
                { label: "Suspended", value: "suspended" },
                { label: "Terminated", value: "terminated" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "partner_name",
              title: "Partner Name",
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



