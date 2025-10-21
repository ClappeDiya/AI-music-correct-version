"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Loader2 } from "lucide-react";
import { voiceAnalysis, AnalysisProgress } from "@/services/api/voice-analysis";

interface AnalysisProgressProps {
  analysisId: number;
  onComplete: () => void;
}

const ANALYSIS_STEPS = {
  timbre: "Analyzing voice timbre characteristics...",
  pitch: "Processing pitch variations and patterns...",
  cadence: "Evaluating speech rhythm and cadence...",
  quality: "Assessing overall voice quality metrics...",
  finalizing: "Finalizing analysis results...",
};

export function AnalysisProgress({
  analysisId,
  onComplete,
}: AnalysisProgressProps) {
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkProgress = async () => {
      try {
        const status = await voiceAnalysis.getAnalysisStatus(analysisId);
        setProgress(status);

        if (status.progress_percentage === 100) {
          onComplete();
        }
      } catch (err) {
        setError("Failed to fetch analysis progress");
      }
    };

    const interval = setInterval(checkProgress, 1000);
    return () => clearInterval(interval);
  }, [analysisId, onComplete]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Voice Analysis in Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress?.progress_percentage || 0} />
          <p className="text-sm text-muted-foreground">
            {progress?.current_step &&
              ANALYSIS_STEPS[
                progress.current_step as keyof typeof ANALYSIS_STEPS
              ]}
          </p>
          {progress?.estimated_time_remaining && (
            <p className="text-sm text-muted-foreground">
              Estimated time remaining:{" "}
              {Math.ceil(progress.estimated_time_remaining / 60)} minutes
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
