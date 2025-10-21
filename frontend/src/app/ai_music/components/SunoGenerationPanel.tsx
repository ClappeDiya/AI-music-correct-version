"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Progress } from "@/components/ui/Progress";
import { useToast } from "@/components/ui/useToast";
import { SunoProviderOptions, SunoOptions } from "./SunoProviderOptions";
import { createSunoGeneration, checkSunoGenerationStatus, SunoGenerationStatus } from "@/services/api/suno_service";

interface SunoGenerationPanelProps {
  onGenerationComplete: (audioUrl: string, metadata: any) => void;
}

export function SunoGenerationPanel({ onGenerationComplete }: SunoGenerationPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [sunoOptions, setSunoOptions] = useState<SunoOptions>({
    make_instrumental: false,
    vocals_only: false,
    custom_mode: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<SunoGenerationStatus | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();

  // Poll for status updates when we have a task ID
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (taskId && isGenerating) {
      interval = setInterval(async () => {
        try {
          const result = await checkSunoGenerationStatus(taskId);
          
          if (result.success && result.data) {
            setStatus(result.data);
            
            // Update progress estimation
            if (result.data.progress !== undefined) {
              setProgress(result.data.progress);
            } else if (result.data.status === 'pending') {
              setProgress(10);
            } else if (result.data.status === 'processing') {
              setProgress(50);
            } else if (result.data.status === 'completed') {
              setProgress(100);
            }
            
            // Handle completion
            if (result.data.status === 'completed' && result.data.audio_url) {
              setIsGenerating(false);
              clearInterval(interval);
              onGenerationComplete(result.data.audio_url, {
                provider: 'suno',
                task_id: taskId,
                make_instrumental: sunoOptions.make_instrumental,
                vocals_only: sunoOptions.vocals_only
              });
              
              toast({
                title: "Generation Complete",
                description: "Your music has been generated successfully!",
              });
            }
            
            // Handle failure
            else if (result.data.status === 'failed') {
              setIsGenerating(false);
              clearInterval(interval);
              
              toast({
                title: "Generation Failed",
                description: result.data.error_message || "An unknown error occurred",
                variant: "destructive",
              });
            }
          } else if (!result.success) {
            toast({
              title: "Status Check Failed",
              description: result.error || "Failed to check generation status",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error checking generation status:", error);
          toast({
            title: "Status Check Error",
            description: "An error occurred while checking generation status",
            variant: "destructive",
          });
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [taskId, isGenerating, onGenerationComplete, toast, sunoOptions]);

  const handleOptionsChange = useCallback((options: SunoOptions) => {
    setSunoOptions(options);
  }, []);

  const handleGenerateClick = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate music",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(5);
    setTaskId(null);
    setStatus(null);

    try {
      const result = await createSunoGeneration({
        prompt: prompt,
        ...sunoOptions
      });

      if (result.success && result.data) {
        setTaskId(result.data.task_id);
        toast({
          title: "Generation Started",
          description: "Your music is being generated. This might take a few minutes.",
        });
      } else {
        setIsGenerating(false);
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to start music generation",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsGenerating(false);
      console.error("Error generating music:", error);
      toast({
        title: "Generation Error",
        description: "An error occurred while generating music",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Suno AI Music Generation</h2>
          <p className="text-sm text-muted-foreground">
            Generate music directly with Suno AI by providing a prompt and options
          </p>
        </div>

        <Tabs 
          defaultValue="basic" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Describe the music you want to generate... (e.g. 'A dreamy pop song with female vocals about summer memories')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                className="min-h-[120px]"
              />
            </div>
            
            <Button
              onClick={handleGenerateClick}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate with Suno"}
            </Button>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <SunoProviderOptions 
              onChange={handleOptionsChange}
              initialValues={sunoOptions}
            />
          </TabsContent>
        </Tabs>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generation in progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground mt-1">
              Status: {status?.status || "Initializing..."}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 