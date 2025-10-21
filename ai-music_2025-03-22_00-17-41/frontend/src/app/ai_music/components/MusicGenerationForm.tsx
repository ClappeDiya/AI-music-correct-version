"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Slider } from "@/components/ui/Slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import AdvancedParameterControls from "./AdvancedParameterControls";

interface MusicGenerationFormProps {
  onSubmit: (data: {
    prompt: string;
    style: string;
    mood: string;
    duration: number;
    complexity: number;
    advancedParameters?: any;
  }) => Promise<void>;
  isLoading: boolean;
  initialValues?: Record<string, any> | null;
}

export function MusicGenerationForm({
  onSubmit,
  isLoading,
  initialValues = null,
}: MusicGenerationFormProps) {
  const [prompt, setPrompt] = useState(initialValues?.prompt || "");
  const [style, setStyle] = useState(initialValues?.style || "pop");
  const [mood, setMood] = useState(initialValues?.mood || "neutral");
  const [duration, setDuration] = useState(initialValues?.duration || 30);
  const [complexity, setComplexity] = useState(initialValues?.complexity || 50);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedParameters, setAdvancedParameters] = useState<Record<string, any>>(
    initialValues?.advancedParameters || {}
  );
  
  useEffect(() => {
    if (initialValues) {
      if (initialValues.prompt !== undefined) setPrompt(initialValues.prompt);
      if (initialValues.style !== undefined) setStyle(initialValues.style);
      if (initialValues.mood !== undefined) setMood(initialValues.mood);
      if (initialValues.duration !== undefined) setDuration(initialValues.duration);
      if (initialValues.complexity !== undefined) setComplexity(initialValues.complexity);
      if (initialValues.advancedParameters) {
        setAdvancedParameters(prev => ({
          ...prev,
          ...initialValues.advancedParameters
        }));
      }
    }
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      prompt,
      style,
      mood,
      duration,
      complexity,
      advancedParameters,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Controls</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt">Describe Your Music</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the music you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Input
                  id="style"
                  placeholder="e.g., Jazz, Rock, Classical"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mood">Mood</Label>
                <Input
                  id="mood"
                  placeholder="e.g., Upbeat, Mellow, Energetic"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Duration (seconds): {duration}</Label>
                <Slider
                  value={[duration]}
                  onValueChange={(value) => setDuration(value[0])}
                  min={10}
                  max={180}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Complexity: {complexity}</Label>
                <Slider
                  value={[complexity]}
                  onValueChange={(value) => setComplexity(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedParameterControls
              onParameterChange={setAdvancedParameters}
            />
          </TabsContent>
        </Tabs>
      </Card>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Music"}
      </Button>
    </form>
  );
}
