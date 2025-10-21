"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/useToast";
import { Download, Upload, FileJson, Loader2 } from "lucide-react";

interface Props {
  modelId: number;
  onImportComplete?: () => void;
}

export function ModelTransfer({ modelId, onImportComplete }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Implement export logic here
      const response = await fetch(
        `/api/voice_cloning/models/${modelId}/export`,
      );
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `voice-model-${modelId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Model exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export model",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/voice_cloning/models/${modelId}/import`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Import failed");

      toast({
        title: "Success",
        description: "Model imported successfully",
      });

      onImportComplete?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import model",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileJson className="h-4 w-4 mr-2" />
            )}
            {isExporting ? "Exporting..." : "Export Model"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
            />
            {isImporting && (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
