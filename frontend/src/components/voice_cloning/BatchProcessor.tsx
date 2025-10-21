"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/useToast";
import { BatchProcessingJob } from "@/services/batch-processor";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface BatchProcessorProps {
  jobId: string;
  onComplete: () => void;
}

export function BatchProcessor({ jobId, onComplete }: BatchProcessorProps) {
  const [job, setJob] = useState<BatchProcessingJob | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await batchProcessor.getJobStatus(jobId);
        setJob(status);

        if (status?.status === "completed") {
          onComplete();
        } else if (status?.status !== "failed") {
          setTimeout(checkStatus, 1000);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to check job status",
          variant: "destructive",
        });
      }
    };

    checkStatus();
  }, [jobId, onComplete]);

  if (!job) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {job.status === "processing" && (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}
            {job.status === "completed" && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {job.status === "failed" && (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Batch Processing
          </div>
          <Badge
            variant={
              job.status === "completed"
                ? "default"
                : job.status === "failed"
                  ? "destructive"
                  : "secondary"
            }
          >
            {job.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={job.progress} />

          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {job.results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {result.trackId && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {result.error && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">Track {index + 1}</span>
                  </div>
                  {result.error && (
                    <span className="text-sm text-red-500">{result.error}</span>
                  )}
                  {result.trackId && (
                    <span className="text-sm text-muted-foreground">
                      ID: {result.trackId}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
