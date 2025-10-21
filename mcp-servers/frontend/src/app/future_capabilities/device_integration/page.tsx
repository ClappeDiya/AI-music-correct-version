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
import { DeviceIntegrationConfig } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "device_name",
    label: "Device Name",
    type: "text" as const,
    description: "Name of the device",
  },
  {
    name: "device_type",
    label: "Device Type",
    type: "select" as const,
    options: [
      { label: "MIDI Controller", value: "midi_controller" },
      { label: "Audio Interface", value: "audio_interface" },
      { label: "VR Controller", value: "vr_controller" },
      { label: "Motion Sensor", value: "motion_sensor" },
      { label: "Biometric Sensor", value: "biometric_sensor" },
      { label: "Custom Device", value: "custom" },
    ],
  },
  {
    name: "connection_type",
    label: "Connection Type",
    type: "select" as const,
    options: [
      { label: "USB", value: "usb" },
      { label: "Bluetooth", value: "bluetooth" },
      { label: "WiFi", value: "wifi" },
      { label: "Serial", value: "serial" },
      { label: "Network", value: "network" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Connected", value: "connected" },
      { label: "Disconnected", value: "disconnected" },
      { label: "Error", value: "error" },
      { label: "Pairing", value: "pairing" },
    ],
  },
  {
    name: "configuration",
    label: "Configuration",
    type: "json" as const,
    description: "Device-specific configuration settings",
  },
  {
    name: "mapping_rules",
    label: "Mapping Rules",
    type: "json" as const,
    description: "Rules for mapping device inputs to system actions",
  },
  {
    name: "calibration_data",
    label: "Calibration Data",
    type: "json" as const,
    description: "Device calibration settings and data",
  },
  {
    name: "permissions",
    label: "Permissions",
    type: "json" as const,
    description: "Device access permissions and restrictions",
  },
];

export default function DeviceIntegrationPage() {
  const router = useRouter();
  const [data, setData] = React.useState<DeviceIntegrationConfig[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.deviceIntegration.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load device configurations:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<DeviceIntegrationConfig>) {
    try {
      await futureCapabilitiesApi.deviceIntegration.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create device configuration:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Device Integration</h2>
          <p className="text-muted-foreground">
            Manage connected devices and their configurations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Device Configuration</DialogTitle>
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
              id: "device_type",
              title: "Device Type",
              options: [
                { label: "MIDI Controller", value: "midi_controller" },
                { label: "Audio Interface", value: "audio_interface" },
                { label: "VR Controller", value: "vr_controller" },
                { label: "Motion Sensor", value: "motion_sensor" },
                { label: "Biometric Sensor", value: "biometric_sensor" },
                { label: "Custom Device", value: "custom" },
              ],
            },
            {
              id: "connection_type",
              title: "Connection",
              options: [
                { label: "USB", value: "usb" },
                { label: "Bluetooth", value: "bluetooth" },
                { label: "WiFi", value: "wifi" },
                { label: "Serial", value: "serial" },
                { label: "Network", value: "network" },
              ],
            },
            {
              id: "status",
              title: "Status",
              options: [
                { label: "Connected", value: "connected" },
                { label: "Disconnected", value: "disconnected" },
                { label: "Error", value: "error" },
                { label: "Pairing", value: "pairing" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "device_name",
              title: "Device Name",
            },
          ]}
        />
      </div>
    </Layout>
  );
}



