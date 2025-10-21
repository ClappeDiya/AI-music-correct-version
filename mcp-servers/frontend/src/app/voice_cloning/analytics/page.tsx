"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useToast } from "@/components/ui/useToast";
import { DetailedMetrics } from "@/components/voice_cloning/DetailedMetrics";
import { ErrorAnalysis } from "@/components/voice_cloning/ErrorAnalysis";
import { AdvancedVisualization } from "@/components/voice_cloning/AdvancedVisualization";
import { ActivityLog } from "@/components/voice_cloning/ActivityLog";
import { VoiceModel, voiceCloning } from "@/services/api/voice_cloning";
import { Loader2, Activity, AlertTriangle, LineChart, History } from "lucide-react";

export default function AnalyticsPage() {
  const [models, setModels] = useState<VoiceModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const response = await voiceCloning.getVoiceModels();
      setModels(response.data);
      if (response.data.length > 0) {
        setSelectedModelId(response.data[0].id.toString());
      }
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
      <div className="mb-6">
        <Select
          value={selectedModelId}
          onValueChange={setSelectedModelId}
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
                Model #{model.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedModelId && (
        <Tabs defaultValue="metrics">
          <TabsList>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Error Analysis
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Visualization
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="metrics">
              <DetailedMetrics 
                modelId={parseInt(selectedModelId)} 
              />
            </TabsContent>

            <TabsContent value="errors">
              <ErrorAnalysis 
                modelId={parseInt(selectedModelId)} 
              />
            </TabsContent>

            <TabsContent value="visualization">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <AdvancedVisualization 
                    modelId={parseInt(selectedModelId)}
                    width={800}
                    height={400}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <ActivityLog 
                modelId={parseInt(selectedModelId)}
                userId={models.find(m => m.id.toString() === selectedModelId)?.user.id || ""}
              />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
} 

