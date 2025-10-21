"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useToast } from "@/components/ui/useToast";
import { CollaborationPresence } from "@/components/voice_cloning/CollaborationPresence";
import { CollaborativeComments } from "@/components/voice_cloning/CollaborativeComments";
import { CollaborativeDrawing } from "@/components/voice_cloning/CollaborativeDrawing";
import { VoiceModel, voiceCloning } from "@/services/api/voice_cloning";
import { Loader2, Users, MessageSquare, PenTool } from "lucide-react";

export default function CollaborationPage() {
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

  const currentUser = models.find(m => m.id.toString() === selectedModelId)?.user;

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

      {selectedModelId && currentUser && (
        <>
          <div className="mb-6">
            <CollaborationPresence
              modelId={parseInt(selectedModelId)}
              userId={currentUser.id}
            />
          </div>

          <Tabs defaultValue="comments">
            <TabsList>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="drawing" className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Drawing Board
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="comments">
                <CollaborativeComments
                  modelId={parseInt(selectedModelId)}
                  userId={currentUser.id}
                  userName={currentUser.name}
                  userAvatar={currentUser.avatar}
                />
              </TabsContent>

              <TabsContent value="drawing">
                <CollaborativeDrawing
                  modelId={parseInt(selectedModelId)}
                  userId={currentUser.id}
                />
              </TabsContent>
            </div>
          </Tabs>
        </>
      )}
    </div>
  );
} 
