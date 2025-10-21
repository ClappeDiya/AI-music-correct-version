"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/usetoast";
import { TrainingProgress } from '@/components/voice_cloning/TrainingProgress';
import { BatchProcessor } from '@/components/voice_cloning/BatchProcessor';
import { VoiceModel, voiceCloning } from "@/services/api/voice_cloning";
import { Loader2, Brain, ArrowLeft } from "lucide-react";
import { ModelParameters } from '@/components/voice_cloning/ModelParameters';

interface Props {
  params: {
    id: string;
  };
}

export default function ModelTrainingPage({ params }: Props) {
  const [model, setModel] = useState<VoiceModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [batchJobId, setBatchJobId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadModel();
  }, [params.id]);

  const loadModel = async () => {
    try {
      const response = await voiceCloning.getVoiceModel(parseInt(params.id));
      setModel(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load model",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startTraining = async () => {
    try {
      const response = await voiceCloning.startTraining(parseInt(params.id));
      setBatchJobId(response.data.job_id);
      setIsTraining(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start training",
        variant: "destructive"
      });
    }
  };

  const handleTrainingComplete = () => {
    toast({
      title: "Success",
      description: "Model training completed successfully",
    });
    router.push(`/voice_cloning/models/${params.id}`);
  };

  if (isLoading || !model) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Train Model #{model.id}</h1>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Model
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Training Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Model Information</h4>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(model.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Languages: {model.supported_languages.join(", ")}
                </p>
              </div>

              {!isTraining && (
                <Button
                  className="w-full"
                  onClick={startTraining}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Start Training
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isTraining && batchJobId && (
          <BatchProcessor
            jobId={batchJobId}
            onComplete={handleTrainingComplete}
          />
        )}
      </div>
    </div>
  );
} 