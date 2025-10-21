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
import { MicrofluidicInstrumentConfig } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "instrument_name",
    label: "Instrument Name",
    type: "text" as const,
    description: "Name of the microfluidic instrument",
  },
  {
    name: "instrument_type",
    label: "Instrument Type",
    type: "select" as const,
    options: [
      { label: "Droplet Generator", value: "droplet_generator" },
      { label: "Flow Controller", value: "flow_controller" },
      { label: "Mixer", value: "mixer" },
      { label: "Separator", value: "separator" },
      { label: "Analyzer", value: "analyzer" },
      { label: "Custom", value: "custom" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Online", value: "online" },
      { label: "Offline", value: "offline" },
      { label: "Maintenance", value: "maintenance" },
      { label: "Error", value: "error" },
    ],
  },
  {
    name: "flow_configuration",
    label: "Flow Configuration",
    type: "json" as const,
    description: "Fluid flow control settings",
  },
  {
    name: "pressure_settings",
    label: "Pressure Settings",
    type: "json" as const,
    description: "Pressure control parameters",
  },
  {
    name: "temperature_controls",
    label: "Temperature Controls",
    type: "json" as const,
    description: "Temperature regulation settings",
  },
  {
    name: "calibration_data",
    label: "Calibration Data",
    type: "json" as const,
    description: "Instrument calibration parameters",
  },
  {
    name: "maintenance_schedule",
    label: "Maintenance Schedule",
    type: "json" as const,
    description: "Maintenance timing and requirements",
  },
  {
    name: "safety_protocols",
    label: "Safety Protocols",
    type: "json" as const,
    description: "Safety measures and emergency procedures",
  },
];

export default function MicrofluidicPage() {
  const router = useRouter();
  const [data, setData] = React.useState<MicrofluidicInstrumentConfig[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.microfluidic.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load instrument configurations:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<MicrofluidicInstrumentConfig>) {
    try {
      await futureCapabilitiesApi.microfluidic.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create instrument configuration:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Microfluidic Instruments</h2>
          <p className="text-muted-foreground">
            Configure and monitor microfluidic instrument settings
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Instrument
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Instrument Configuration</DialogTitle>
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
              id: "instrument_type",
              title: "Type",
              options: [
                { label: "Droplet Generator", value: "droplet_generator" },
                { label: "Flow Controller", value: "flow_controller" },
                { label: "Mixer", value: "mixer" },
                { label: "Separator", value: "separator" },
                { label: "Analyzer", value: "analyzer" },
                { label: "Custom", value: "custom" },
              ],
            },
            {
              id: "status",
              title: "Status",
              options: [
                { label: "Online", value: "online" },
                { label: "Offline", value: "offline" },
                { label: "Maintenance", value: "maintenance" },
                { label: "Error", value: "error" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "instrument_name",
              title: "Instrument Name",
            },
          ]}
        />
      </div>
    </Layout>
  );
}



