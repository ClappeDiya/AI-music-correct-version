"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from "@/components/ui/useToast";
import { VoiceModel, voiceCloning } from "@/services/api/voice_cloning";
import { AudioComparison } from "@/components/voice_cloning/AudioComparison";
import { AnalysisComparison } from "@/components/voice_cloning/AnalysisComparison";
import { DetailedMetrics } from "@/components/voice_cloning/DetailedMetrics";
import { Loader2, ArrowLeftRight } from "lucide-react";

export default function CompareModelsPage() {
  const [models, setModels] = useState<VoiceModel[]>([]);
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const response = await voiceCloning.getVoiceModels();
      setModels(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load models",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (position: number, modelId: string) => {
    setSelectedModels(prev => {
      const newSelected = [...prev];
      newSelected[position] = parseInt(modelId);
      return newSelected;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Compare Models</h1>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {[0, 1].map((position) => (
          <Card key={position}>
            <CardHeader>
              <CardTitle>Select Model {position + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedModels[position]?.toString()}
                onValueChange={(value) => handleModelSelect(position, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem
                      key={model.id}
                      value={model.id.toString()}
                    >
                      Model #{model.id} - {model.user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedModels.length === 2 && (
        <div className="space-y-6">
          <AudioComparison
            originalAudioUrl={models.find(m => m.id === selectedModels[0])?.sample_url || ''}
            clonedAudioUrl={models.find(m => m.id === selectedModels[1])?.sample_url || ''}
          />

          <AnalysisComparison
            currentAnalysis={models.find(m => m.id === selectedModels[0])?.latest_analysis || null}
            previousAnalyses={[models.find(m => m.id === selectedModels[1])?.latest_analysis || null].filter(Boolean)}
          />

          <div className="grid gap-6 md:grid-cols-2">
            {selectedModels.map((modelId) => (
              <DetailedMetrics
                key={modelId}
                modelId={modelId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 

