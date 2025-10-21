"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hovercard";
import { useToast } from "@/components/ui/usetoast";
import { InfoIcon } from "lucide-react";
import { updateTrackParameters } from "@/app/api/ai-music-generation";

interface ParameterRange {
  min: number;
  max: number;
  step: number;
  default: number;
  description: string;
}

interface StyleParameters {
  tempo: number;
  complexity: number;
  emotionalIntensity: number;
  emotionalTone: string;
  style: string;
}

const PARAMETER_RANGES: Record<string, ParameterRange> = {
  tempo: {
    min: 60,
    max: 200,
    step: 1,
    default: 120,
    description:
      "Tempo controls the speed of the music (60-200 BPM). Standard ranges: Slow (60-85), Moderate (85-120), Fast (120-200)",
  },
  complexity: {
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.5,
    description:
      "Complexity affects the intricacy of musical patterns. Lower values create simpler, more accessible patterns while higher values generate more intricate compositions",
  },
  emotionalIntensity: {
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.5,
    description:
      "Emotional intensity controls the dynamic range and expressiveness. Lower values create subtle emotions while higher values produce more dramatic expressions",
  },
};

const EMOTIONAL_TONES = [
  "joyful",
  "melancholic",
  "energetic",
  "calm",
  "tense",
  "peaceful",
  "dramatic",
  "neutral",
];

const STYLES = [
  "classical",
  "jazz",
  "electronic",
  "rock",
  "ambient",
  "folk",
  "experimental",
  "fusion",
];

interface StyleParameterControlsProps {
  trackId: string;
  initialParameters: StyleParameters;
  onParametersUpdate: (parameters: StyleParameters) => void;
}

export function StyleParameterControls({
  trackId,
  initialParameters,
  onParametersUpdate,
}: StyleParameterControlsProps) {
  const [parameters, setParameters] =
    useState<StyleParameters>(initialParameters);
  const { toast } = useToast();

  useEffect(() => {
    setParameters(initialParameters);
  }, [initialParameters]);

  const handleParameterChange = async (
    key: keyof StyleParameters,
    value: number | string,
  ) => {
    try {
      const updatedParameters = {
        ...parameters,
        [key]: value,
      };
      setParameters(updatedParameters);

      await updateTrackParameters(trackId, {
        styleParameters: updatedParameters,
      });

      onParametersUpdate(updatedParameters);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${key}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Style & Emotion Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Numeric Parameters */}
        {Object.entries(PARAMETER_RANGES).map(([key, range]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label className="capitalize">{key}</Label>
                <HoverCard>
                  <HoverCardTrigger>
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p className="text-sm">{range.description}</p>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <span className="text-sm text-muted-foreground">
                {key === "tempo"
                  ? `${Math.round(parameters[key as keyof StyleParameters] as number)} BPM`
                  : `${Math.round((parameters[key as keyof StyleParameters] as number) * 100)}%`}
              </span>
            </div>
            <Slider
              value={[parameters[key as keyof StyleParameters] as number]}
              min={range.min}
              max={range.max}
              step={range.step}
              onValueChange={([value]) =>
                handleParameterChange(key as keyof StyleParameters, value)
              }
            />
          </div>
        ))}

        {/* Emotional Tone Select */}
        <div className="space-y-2">
          <Label>Emotional Tone</Label>
          <Select
            value={parameters.emotionalTone}
            onValueChange={(value) =>
              handleParameterChange("emotionalTone", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select emotional tone" />
            </SelectTrigger>
            <SelectContent>
              {EMOTIONAL_TONES.map((tone) => (
                <SelectItem key={tone} value={tone}>
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Style Select */}
        <div className="space-y-2">
          <Label>Style</Label>
          <Select
            value={parameters.style}
            onValueChange={(value) => handleParameterChange("style", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {STYLES.map((style) => (
                <SelectItem key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
