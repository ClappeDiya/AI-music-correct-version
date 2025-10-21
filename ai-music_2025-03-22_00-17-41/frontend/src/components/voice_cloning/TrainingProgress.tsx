"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Brain, Clock, AlertCircle } from "lucide-react";
import { VoiceCloningWebSocket } from "@/services/websocket/voice_cloning";

interface TrainingStep {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  progress: number;
  details?: string;
}

interface Props {
  modelId: number;
  onComplete?: () => void;
}

export function TrainingProgress({ modelId, onComplete }: Props) {
  const [steps, setSteps] = useState<TrainingStep[]>([
    {
      id: "preprocessing",
      name: "Audio Preprocessing",
      status: "pending",
      progress: 0,
    },
    {
      id: "feature_extraction",
      name: "Feature Extraction",
      status: "pending",
      progress: 0,
    },
    {
      id: "model_training",
      name: "Model Training",
      status: "pending",
      progress: 0,
    },
    {
      id: "validation",
      name: "Model Validation",
      status: "pending",
      progress: 0,
    },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    const ws = new VoiceCloningWebSocket(modelId);

    ws.subscribe("training_progress", (data) => {
      setSteps((current) =>
        current.map((step) => {
          if (step.id === data.step) {
            return {
              ...step,
              progress: data.progress,
              status: data.status,
              details: data.details,
            };
          }
          return step;
        }),
      );

      if (data.status === "completed") {
        const nextStepIndex = steps.findIndex((s) => s.id === data.step) + 1;
        if (nextStepIndex < steps.length) {
          setCurrentStep(nextStepIndex);
        }
      }
    });

    ws.connect();
    return () => ws.disconnect();
  }, [modelId]);

  useEffect(() => {
    if (currentStep === 0 && !startTime) {
      setStartTime(new Date());
    }

    if (
      currentStep === steps.length - 1 &&
      steps[steps.length - 1].progress === 100
    ) {
      onComplete?.();
    }
  }, [currentStep, steps, startTime, onComplete]);

  const getStatusColor = (status: TrainingStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const getElapsedTime = () => {
    if (!startTime) return "0:00";
    const elapsed = Math.floor(
      (new Date().getTime() - startTime.getTime()) / 1000,
    );
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <h3 className="font-semibold">Training Progress</h3>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{getElapsedTime()}</span>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={getStatusColor(step.status)}
                    >
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{step.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {step.progress}%
                  </span>
                </div>
                <Progress value={step.progress} />
                {step.details && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    {step.details}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
