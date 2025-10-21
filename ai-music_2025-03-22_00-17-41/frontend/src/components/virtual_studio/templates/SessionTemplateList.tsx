"use client";

import { useState, useEffect } from "react";
import { Copy, Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SessionTemplateForm } from "./session-template-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import type { SessionTemplate } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

const columns = [
  {
    accessorKey: "template_name",
    header: "Name",
  },
  {
    accessorKey: "template_data.description",
    header: "Description",
  },
  {
    accessorKey: "template_data.default_tracks",
    header: "Tracks",
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
      const template = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => row.original.onEdit(template)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => row.original.onDelete(template)}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => row.original.onUseTemplate(template)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Use Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface SessionTemplateListProps {
  onTemplateSelect?: (template: SessionTemplate) => void;
  onUseTemplate?: (template: SessionTemplate) => void;
}

export function SessionTemplateList({
  onTemplateSelect,
  onUseTemplate,
}: SessionTemplateListProps) {
  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<SessionTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await virtualStudioApi.getSessionTemplates();
      const templatesWithActions = data.map((template) => ({
        ...template,
        onEdit: handleEditTemplate,
        onDelete: handleDeleteTemplate,
        onUseTemplate: handleUseTemplate,
      }));
      setTemplates(templatesWithActions);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsDialogOpen(true);
  };

  const handleEditTemplate = (template: SessionTemplate) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const handleDeleteTemplate = async (template: SessionTemplate) => {
    try {
      await virtualStudioApi.deleteSessionTemplate(template.id);
      loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleUseTemplate = (template: SessionTemplate) => {
    if (onUseTemplate) {
      onUseTemplate(template);
    }
  };

  const handleTemplateSubmit = async (template: SessionTemplate) => {
    setIsDialogOpen(false);
    loadTemplates();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Session Templates</CardTitle>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={templates}
          onRowClick={
            onTemplateSelect
              ? (row) => onTemplateSelect(row.original)
              : undefined
          }
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedTemplate ? "Edit Template" : "Create Template"}
              </DialogTitle>
            </DialogHeader>
            <SessionTemplateForm
              initialData={selectedTemplate || undefined}
              onSubmit={handleTemplateSubmit}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
