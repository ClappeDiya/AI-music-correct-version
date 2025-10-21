"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from '@/components/ui/Button';
import { Plus, Music, Trash2 } from "lucide-react";
import { 
  PerformanceRecording,
  PerformanceAnalysis,
  musicEducationApi 
} from '@/services/music_education/api';
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/AlertDialog";
import { Progress } from '@/components/ui/Progress';

const DeleteDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title = "Delete Item", 
  description = "Are you sure you want to delete this item? This action cannot be undone."
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onConfirm: () => void;
  title?: string;
  description?: string;
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export function PerformanceSection() {
  const [recordings, setRecordings] = useState<PerformanceRecording[]>([]);
  const [analyses, setAnalyses] = useState<Record<number, PerformanceAnalysis>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const response = await musicEducationApi.getPerformanceRecordings();
      setRecordings(response);
      
      await Promise.all(
        response.map(async (recording: PerformanceRecording) => {
          try {
            const analysis = await musicEducationApi.getPerformanceAnalysis(
              recording.id
            );
            setAnalyses((prev) => ({
              ...prev,
              [recording.id]: analysis,
            }));
          } catch (error) {
            console.error(
              `Failed to load analysis for recording ${recording.id}:`,
              error
            );
          }
        })
      );
    } catch (error) {
      console.error("Failed to load recordings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await musicEducationApi.createPerformanceRecording(formData);
      toast.success("Recording uploaded successfully");
      loadRecordings();
    } catch (error) {
      console.error("Failed to upload recording:", error);
      toast.error("Failed to upload recording");
    }
  };

  const handleDelete = async () => {
    if (!selectedRecording) return;

    try {
      await musicEducationApi.deletePerformanceRecording(selectedRecording);
      toast.success("Recording deleted successfully");
      setSelectedRecording(null);
      loadRecordings();
    } catch (error) {
      console.error("Failed to delete recording:", error);
      toast.error("Failed to delete recording");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Recordings</h2>
          <p className="text-muted-foreground">
            Upload and analyze your music performances
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            id="recording-upload"
            className="hidden"
            accept="audio/*"
            onChange={handleFileUpload}
          />
          <Button asChild>
            <label htmlFor="recording-upload" className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Upload Recording
            </label>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-4"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recordings.map((recording) => {
            const analysis = analyses[recording.id];
            return (
              <Card key={recording.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <Music className="w-5 h-5" />
                      <CardTitle className="text-lg">
                        Recording {recording.id}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedRecording(recording.id);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <audio
                      src={recording.file_url}
                      controls
                      className="w-full"
                    />
                    {analysis && (
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Pitch Accuracy</span>
                            <span>{analysis.analysis_data.pitch_accuracy}%</span>
                          </div>
                          <Progress
                            value={analysis.analysis_data.pitch_accuracy}
                          />
                        </div>
                        {analysis.analysis_data.feedback && (
                          <p className="text-sm text-muted-foreground">
                            {analysis.analysis_data.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Recording"
        description="Are you sure you want to delete this recording? This action cannot be undone."
      />
    </div>
  );
} 
