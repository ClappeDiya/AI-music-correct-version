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
import { InterstellarLatencyConfig } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "config_name",
    label: "Configuration Name",
    type: "text" as const,
    description: "Name of the latency configuration",
  },
  {
    name: "config_type",
    label: "Configuration Type",
    type: "select" as const,
    options: [
      { label: "Deep Space", value: "deep_space" },
      { label: "Planetary", value: "planetary" },
      { label: "Orbital", value: "orbital" },
      { label: "Quantum", value: "quantum" },
      { label: "Hybrid", value: "hybrid" },
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
      { label: "Optimizing", value: "optimizing" },
    ],
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    description: "Detailed description of the configuration",
  },
  {
    name: "latency_parameters",
    label: "Latency Parameters",
    type: "json" as const,
    description: "Core latency configuration parameters",
  },
  {
    name: "compensation_strategies",
    label: "Compensation Strategies",
    type: "json" as const,
    description: "Strategies for handling latency",
  },
  {
    name: "routing_protocols",
    label: "Routing Protocols",
    type: "json" as const,
    description: "Data routing and transmission protocols",
  },
  {
    name: "quantum_entanglement",
    label: "Quantum Entanglement",
    type: "json" as const,
    description: "Quantum communication configurations",
  },
  {
    name: "performance_metrics",
    label: "Performance Metrics",
    type: "json" as const,
    description: "Configuration performance measurements",
  },
];

export default function InterstellarLatencyPage() {
  const router = useRouter();
  const [data, setData] = React.useState<InterstellarLatencyConfig[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.interstellarLatency.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load latency configurations:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<InterstellarLatencyConfig>) {
    try {
      await futureCapabilitiesApi.interstellarLatency.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create latency configuration:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Interstellar Latency</h2>
          <p className="text-muted-foreground">
            Configure and optimize interstellar communication latency
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Configuration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Latency Configuration</DialogTitle>
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
              id: "config_type",
              title: "Type",
              options: [
                { label: "Deep Space", value: "deep_space" },
                { label: "Planetary", value: "planetary" },
                { label: "Orbital", value: "orbital" },
                { label: "Quantum", value: "quantum" },
                { label: "Hybrid", value: "hybrid" },
              ],
            },
            {
              id: "status",
              title: "Status",
              options: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Testing", value: "testing" },
                { label: "Optimizing", value: "optimizing" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "config_name",
              title: "Configuration Name",
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



