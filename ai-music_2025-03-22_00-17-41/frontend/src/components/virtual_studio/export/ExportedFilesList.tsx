"use client";

import { useState, useEffect } from "react";
import { Download, FileAudio, MoreHorizontal, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileExportForm } from "./file-export-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import type { ExportedFile } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

const columns = [
  {
    accessorKey: "file_name",
    header: "File Name",
  },
  {
    accessorKey: "format",
    header: "Format",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue("format").toUpperCase()}</Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Exported",
    cell: ({ row }) =>
      new Date(row.getValue("created_at")).toLocaleDateString(),
  },
  {
    accessorKey: "file_size",
    header: "Size",
    cell: ({ row }) => {
      const bytes = row.getValue("file_size");
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const file = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => row.original.onDownload(file)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => row.original.onDelete(file)}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface ExportedFilesListProps {
  sessionId: number;
  onFileSelect?: (file: ExportedFile) => void;
}

export function ExportedFilesList({
  sessionId,
  onFileSelect,
}: ExportedFilesListProps) {
  const [files, setFiles] = useState<ExportedFile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [sessionId]);

  const loadFiles = async () => {
    try {
      const data = await virtualStudioApi.getExportedFiles({
        session: sessionId,
      });
      const filesWithActions = data.map((file) => ({
        ...file,
        onDownload: handleDownloadFile,
        onDelete: handleDeleteFile,
      }));
      setFiles(filesWithActions);
    } catch (error) {
      console.error("Error loading exported files:", error);
    }
  };

  const handleExportNew = () => {
    setIsDialogOpen(true);
  };

  const handleDownloadFile = async (file: ExportedFile) => {
    try {
      // Implement file download logic using file.file_url
      window.open(file.file_url, "_blank");
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleDeleteFile = async (file: ExportedFile) => {
    try {
      await virtualStudioApi.deleteExportedFile(file.id);
      loadFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleExportComplete = (file: ExportedFile) => {
    setIsDialogOpen(false);
    loadFiles();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            Exported Files
          </CardTitle>
          <Button onClick={handleExportNew}>
            <Plus className="h-4 w-4 mr-2" />
            Export New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={files}
          onRowClick={
            onFileSelect ? (row) => onFileSelect(row.original) : undefined
          }
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Export Session</DialogTitle>
            </DialogHeader>
            <FileExportForm
              sessionId={sessionId}
              onExportComplete={handleExportComplete}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
