"use client";

import { useState } from "react";
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  FilePdf,
  Loader2,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Progress } from "@/components/ui/Progress";
import { reportResultsApi } from "@/lib/api/reports";

interface ExportDialogProps {
  reportId: number;
  resultId: number;
}

type ExportFormat = "csv" | "excel" | "pdf";

const exportFormats = [
  {
    id: "csv",
    name: "CSV File",
    icon: FileText,
    description: "Export as comma-separated values",
  },
  {
    id: "excel",
    name: "Excel Spreadsheet",
    icon: FileSpreadsheet,
    description: "Export as Microsoft Excel file",
  },
  {
    id: "pdf",
    name: "PDF Document",
    icon: FilePdf,
    description: "Export as PDF document",
  },
] as const;

export function ExportDialog({ reportId, resultId }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [progress, setProgress] = useState(0);

  const exportMutation = useMutation({
    mutationFn: async () => {
      // Start progress simulation
      setProgress(0);
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      try {
        const response = await reportResultsApi.exportResult(
          reportId,
          resultId,
          format,
        );

        // Complete progress
        clearInterval(progressInterval);
        setProgress(100);

        // Create download link
        const blob = new Blob([response.data], {
          type: getContentType(format),
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `report-${reportId}-${new Date().toISOString()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Reset and close
        setTimeout(() => {
          setProgress(0);
          setOpen(false);
        }, 500);
      } catch (error) {
        clearInterval(progressInterval);
        setProgress(0);
        throw error;
      }
    },
  });

  const selectedFormat = exportFormats.find((f) => f.id === format);
  const FormatIcon = selectedFormat?.icon || FileDown;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Choose a format to export your report data
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as ExportFormat)}
              disabled={exportMutation.isPending}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <FormatIcon className="h-4 w-4" />
                  <SelectValue placeholder="Select format" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {exportFormats.map((format) => (
                  <SelectItem
                    key={format.id}
                    value={format.id}
                    className="flex items-center gap-2"
                  >
                    <format.icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{format.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {exportMutation.isPending && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Preparing your export...
              </p>
            </div>
          )}

          <Button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export {selectedFormat?.name}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getContentType(format: ExportFormat): string {
  switch (format) {
    case "csv":
      return "text/csv";
    case "excel":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}
