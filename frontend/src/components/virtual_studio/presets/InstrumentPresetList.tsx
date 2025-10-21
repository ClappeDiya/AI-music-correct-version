"use client";

import { useState, useEffect } from "react";
import { Download, Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { InstrumentPresetForm } from "./instrument-preset-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import type { InstrumentPreset } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

const columns = [
  {
    accessorKey: "preset_name",
    header: "Name",
  },
  {
    accessorKey: "instrument.name",
    header: "Instrument",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) =>
      new Date(row.getValue("created_at")).toLocaleDateString(),
  },
  {
    accessorKey: "is_public",
    header: "Public",
    cell: ({ row }) => (row.getValue("is_public") ? "Yes" : "No"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const preset = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => row.original.onEdit(preset)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => row.original.onDelete(preset)}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => row.original.onDownload(preset)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface InstrumentPresetListProps {
  onPresetSelect?: (preset: InstrumentPreset) => void;
}

export function InstrumentPresetList({
  onPresetSelect,
}: InstrumentPresetListProps) {
  const [presets, setPresets] = useState<InstrumentPreset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<InstrumentPreset | null>(
    null,
  );

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const data = await virtualStudioApi.getInstrumentPresets();
      const presetsWithActions = data.map((preset) => ({
        ...preset,
        onEdit: handleEditPreset,
        onDelete: handleDeletePreset,
        onDownload: handleDownloadPreset,
      }));
      setPresets(presetsWithActions);
    } catch (error) {
      console.error("Error loading presets:", error);
    }
  };

  const handleCreatePreset = () => {
    setSelectedPreset(null);
    setIsDialogOpen(true);
  };

  const handleEditPreset = (preset: InstrumentPreset) => {
    setSelectedPreset(preset);
    setIsDialogOpen(true);
  };

  const handleDeletePreset = async (preset: InstrumentPreset) => {
    try {
      await virtualStudioApi.deleteInstrumentPreset(preset.id);
      loadPresets();
    } catch (error) {
      console.error("Error deleting preset:", error);
    }
  };

  const handleDownloadPreset = async (preset: InstrumentPreset) => {
    try {
      // Implement preset download logic
      console.log("Downloading preset:", preset);
    } catch (error) {
      console.error("Error downloading preset:", error);
    }
  };

  const handlePresetSubmit = async (preset: InstrumentPreset) => {
    setIsDialogOpen(false);
    loadPresets();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Instrument Presets</CardTitle>
          <Button onClick={handleCreatePreset}>
            <Plus className="h-4 w-4 mr-2" />
            New Preset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={presets}
          onRowClick={
            onPresetSelect ? (row) => onPresetSelect(row.original) : undefined
          }
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPreset ? "Edit Preset" : "Create Preset"}
              </DialogTitle>
            </DialogHeader>
            <InstrumentPresetForm
              initialData={selectedPreset || undefined}
              onSubmit={handlePresetSubmit}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
