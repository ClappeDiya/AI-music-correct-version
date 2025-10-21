"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/Slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/useToast";
import { Disc3, Plus, Trash2, Save, Wand2, Radio } from "lucide-react";
import {
  djPersonaService,
  DJPersona,
  PersonaBlend,
  PersonaPreset,
} from "@/services/djPersonaService";
import { cn } from "@/lib/utils";

interface PersonaBlenderProps {
  sessionId: string;
  className?: string;
}

export function PersonaBlender({ sessionId, className }: PersonaBlenderProps) {
  const { toast } = useToast();
  const [personas, setPersonas] = useState<DJPersona[]>([]);
  const [presets, setPresets] = useState<PersonaPreset[]>([]);
  const [currentBlend, setCurrentBlend] = useState<
    {
      persona: DJPersona;
      weight: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [personasData, presetsData, activeBlend] = await Promise.all([
          djPersonaService.getPersonas(),
          djPersonaService.getPresets(),
          djPersonaService.getActiveBlend(sessionId),
        ]);

        setPersonas(personasData);
        setPresets(presetsData);

        if (activeBlend) {
          setCurrentBlend(
            activeBlend.components.map((c) => ({
              persona: c.persona,
              weight: c.weight,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load DJ personas:", error);
        toast({
          title: "Error",
          description: "Failed to load DJ personas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId, toast]);

  const handleAddPersona = (personaId: string) => {
    const persona = personas.find((p) => p.id === personaId);
    if (!persona) return;

    const newBlend = [...currentBlend];
    if (newBlend.length === 0) {
      newBlend.push({ persona, weight: 1 });
    } else {
      const weight = 1 / (newBlend.length + 1);
      newBlend.forEach((item) => {
        item.weight = weight;
      });
      newBlend.push({ persona, weight });
    }
    setCurrentBlend(newBlend);
  };

  const handleRemovePersona = (index: number) => {
    const newBlend = currentBlend.filter((_, i) => i !== index);
    if (newBlend.length > 0) {
      const weight = 1 / newBlend.length;
      newBlend.forEach((item) => {
        item.weight = weight;
      });
    }
    setCurrentBlend(newBlend);
  };

  const handleWeightChange = (index: number, value: number) => {
    const newBlend = [...currentBlend];
    const oldWeight = newBlend[index].weight;
    const weightDiff = value - oldWeight;

    // Adjust other weights proportionally
    const totalOtherWeight = 1 - oldWeight;
    newBlend.forEach((item, i) => {
      if (i === index) {
        item.weight = value;
      } else {
        const proportion = item.weight / totalOtherWeight;
        item.weight = Math.max(0, item.weight - weightDiff * proportion);
      }
    });

    setCurrentBlend(newBlend);
  };

  const handleSaveBlend = async () => {
    try {
      await djPersonaService.createBlend({
        session: sessionId,
        components: currentBlend.map((item) => ({
          persona_id: item.persona.id,
          weight: item.weight,
        })),
      });

      toast({
        title: "Success",
        description: "DJ persona blend saved successfully",
      });
    } catch (error) {
      console.error("Failed to save blend:", error);
      toast({
        title: "Error",
        description: "Failed to save DJ persona blend",
        variant: "destructive",
      });
    }
  };

  const handleApplyPreset = async (presetId: string) => {
    try {
      const blend = await djPersonaService.applyPresetToSession(
        presetId,
        sessionId,
      );
      setCurrentBlend(
        blend.components.map((c) => ({
          persona: c.persona,
          weight: c.weight,
        })),
      );
      toast({
        title: "Success",
        description: "Preset applied successfully",
      });
    } catch (error) {
      console.error("Failed to apply preset:", error);
      toast({
        title: "Error",
        description: "Failed to apply preset",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5" />
          DJ Persona Blender
        </CardTitle>
        <CardDescription>
          Mix and match DJ personas to create your perfect blend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Preset Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Quick Start with Presets
            </h3>
            <ScrollArea className="h-[100px]">
              <div className="flex flex-wrap gap-2 p-1">
                {presets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPreset(preset.id)}
                    className="flex items-center gap-2"
                  >
                    <Disc3 className="h-4 w-4" />
                    {preset.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Current Blend */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Current Blend</h3>
              <Select
                onValueChange={handleAddPersona}
                disabled={currentBlend.length >= 3}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Add persona" />
                </SelectTrigger>
                <SelectContent>
                  {personas
                    .filter(
                      (p) => !currentBlend.find((b) => b.persona.id === p.id),
                    )
                    .map((persona) => (
                      <SelectItem key={persona.id} value={persona.id}>
                        {persona.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {currentBlend.map((item, index) => (
                <div
                  key={item.persona.id}
                  className="space-y-2 p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.persona.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="secondary">
                          {item.persona.voice_style_display}
                        </Badge>
                        <Badge variant="secondary">
                          {item.persona.transition_style_display}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePersona(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-16">
                      {Math.round(item.weight * 100)}%
                    </span>
                    <Slider
                      value={[item.weight * 100]}
                      onValueChange={([value]) => {
                        handleWeightChange(index, value / 100);
                      }}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              ))}
            </div>

            {currentBlend.length > 0 && (
              <Button className="w-full" onClick={handleSaveBlend}>
                <Save className="h-4 w-4 mr-2" />
                Save & Apply Blend
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
