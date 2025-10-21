"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from "@/components/ui/useToast";
import { DataTable } from "@/components/ui/DataTable";
import { AudioPreview } from "@/components/voice_cloning/AudioPreview";
import { AudioVisualizer } from "@/components/voice_cloning/AudioVisualizer";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { LoadingState } from "../components/loading-state";
import { VoiceSample, voiceCloning } from "@/services/api/voice_cloning";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, Play, Trash2, Upload } from "lucide-react";

export default function SamplesPage() {
  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      const response = await voiceCloning.getVoiceSamples();
      setSamples(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load voice samples",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(file);
      const formData = new FormData();
      formData.append('audio', file);
      await voiceCloning.uploadVoiceSample(formData);
      
      toast({
        title: "Success",
        description: "Voice sample uploaded successfully",
      });
      
      loadSamples();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload voice sample",
        variant: "destructive"
      });
    } finally {
      setUploadingFile(null);
    }
  };

  const handleDelete = async (sampleId: number) => {
    try {
      await voiceCloning.deleteVoiceSample(sampleId);
      toast({
        title: "Success",
        description: "Voice sample deleted successfully",
      });
      loadSamples();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete voice sample",
        variant: "destructive"
      });
    }
  };

  const columns: ColumnDef<VoiceSample>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => `${row.getValue<number>("duration")}s`,
    },
    {
      id: "preview",
      cell: ({ row }) => (
        <AudioPreview previewId={row.original.id} />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(row.original.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState type="full" />;
  }

  return (
    <ErrorBoundary>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Voice Samples</h1>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="w-[300px]"
            />
            {uploadingFile && (
              <LoadingState type="inline" message="Uploading..." />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <DataTable
            columns={columns}
            data={samples}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
} 

