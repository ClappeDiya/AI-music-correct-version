"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/usetoast";
import { ModelHistory } from '@/components/voice_cloning/ModelHistory';
import { ModelAnalytics } from '@/components/voice_cloning/ModelAnalytics';
import { DetailedMetrics } from '@/components/voice_cloning/DetailedMetrics';
import { EmotionVisualization } from '@/components/voice_cloning/EmotionVisualization';
import { VoiceModel, voiceCloning } from "@/services/api/voice_cloning";
import { Loader2, History, Activity, Heart, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ModelSettings } from '@/components/voice_cloning/ModelSettings';
import { ModelSharing } from '@/components/voice_cloning/ModelSharing';

interface Props {
  params: {
    id: string;
  };
}

export default function ModelDetailsPage({ params }: Props) {
  const [model, setModel] = useState<VoiceModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        description: "Failed to load model details",
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

  if (!model) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Model not found</p>
          <Button
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Model #{model.id}</h1>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Models
        </Button>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="emotions" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Emotions
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="history">
            <ModelHistory modelId={model.id} />
          </TabsContent>

          <TabsContent value="metrics">
            <div className="grid gap-6">
              <DetailedMetrics modelId={model.id} />
              <ModelAnalytics modelId={model.id} />
            </div>
          </TabsContent>

          <TabsContent value="emotions">
            <EmotionVisualization
              emotion={model.emotion_profile}
              width={800}
              height={400}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
} 