"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from "@/components/ui/useToast";
import { ModelHistory } from "@/components/voice_cloning/ModelHistory";
import { ModelAnalytics } from "@/components/voice_cloning/ModelAnalytics";
import { ConsentManager } from "@/components/voice_cloning/ConsentManager";
import { VoiceModel, voiceCloning } from "@/services/api/voice_cloning";
import { Loader2 } from "lucide-react";

export default function ModelsPage() {
  const [models, setModels] = useState<VoiceModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<VoiceModel | null>(null);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Voice Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {models.map(model => (
                <Button
                  key={model.id}
                  variant={selectedModel?.id === model.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedModel(model)}
                >
                  Model #{model.id} - {model.created_at}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedModel && (
          <>
            <ModelHistory modelId={selectedModel.id} />
            <ModelAnalytics modelId={selectedModel.id} />
            <ConsentManager 
              voiceId={selectedModel.id}
              onConsentChange={() => loadModels()}
              onDataDeleted={() => {
                setSelectedModel(null);
                loadModels();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
} 

