"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/useToast";
import {
  Wand2,
  Save,
  Copy,
  Trash2,
  Music4,
  Sliders,
  Clock,
  Share2,
} from "lucide-react";
import { hybridDjService, TransitionPreset } from "@/services/hybridDjService";
import { cn } from "@/lib/utils";

interface TransitionEditorProps {
  sessionId: string;
  className?: string;
}

export function TransitionEditor({
  sessionId,
  className,
}: TransitionEditorProps) {
  const { toast } = useToast();
  const [presets, setPresets] = useState<TransitionPreset[]>([]);
  const [currentPreset, setCurrentPreset] = useState<Partial<TransitionPreset>>(
    {
      name: "",
      effect_type: "filter",
      duration: 8.0,
      effect_parameters: {},
      is_public: false,
    },
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPresets = async () => {
      try {
        const data = await hybridDjService.getPresets();
        setPresets(data);
      } catch (error) {
        console.error("Failed to load transition presets:", error);
        toast({
          title: "Error",
          description: "Failed to load transition presets",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPresets();
  }, [toast]);

  const handleEffectTypeChange = (value: string) => {
    const defaultParams: Record<string, any> = {
      filter: {
        cutoff_start: 20000,
        cutoff_end: 200,
        resonance: 0.7,
      },
      echo: {
        feedback: 0.5,
        delay_time: 0.3,
      },
      reverb: {
        room_size: 0.8,
        damping: 0.5,
        wet_level: 0.3,
      },
      power_down: {
        pitch_end: 0.5,
        filter_cutoff: 200,
      },
    };

    setCurrentPreset((prev) => ({
      ...prev,
      effect_type: value,
      effect_parameters: defaultParams[value] || {},
    }));
  };

  const handleParameterChange = (
    param: string,
    value: number | string | boolean,
  ) => {
    setCurrentPreset((prev) => ({
      ...prev,
      effect_parameters: {
        ...prev.effect_parameters,
        [param]: value,
      },
    }));
  };

  const handleSavePreset = async () => {
    try {
      if (currentPreset.id) {
        await hybridDjService.updatePreset(
          currentPreset.id,
          currentPreset as TransitionPreset,
        );
      } else {
        await hybridDjService.createPreset(currentPreset);
      }

      const updatedPresets = await hybridDjService.getPresets();
      setPresets(updatedPresets);

      toast({
        title: "Success",
        description: "Transition preset saved successfully",
      });
    } catch (error) {
      console.error("Failed to save preset:", error);
      toast({
        title: "Error",
        description: "Failed to save transition preset",
        variant: "destructive",
      });
    }
  };

  const handleDuplicatePreset = async (id: string) => {
    try {
      await hybridDjService.duplicatePreset(id);
      const updatedPresets = await hybridDjService.getPresets();
      setPresets(updatedPresets);

      toast({
        title: "Success",
        description: "Transition preset duplicated successfully",
      });
    } catch (error) {
      console.error("Failed to duplicate preset:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate preset",
        variant: "destructive",
      });
    }
  };

  const renderEffectParameters = () => {
    const parameters = currentPreset.effect_parameters || {};
    const parameterConfig: Record<
      string,
      { min: number; max: number; step: number }
    > = {
      cutoff_start: { min: 20, max: 20000, step: 1 },
      cutoff_end: { min: 20, max: 20000, step: 1 },
      resonance: { min: 0, max: 1, step: 0.01 },
      feedback: { min: 0, max: 1, step: 0.01 },
      delay_time: { min: 0, max: 2, step: 0.01 },
      room_size: { min: 0, max: 1, step: 0.01 },
      damping: { min: 0, max: 1, step: 0.01 },
      wet_level: { min: 0, max: 1, step: 0.01 },
      pitch_end: { min: 0, max: 1, step: 0.01 },
    };

    return Object.entries(parameters).map(([key, value]) => (
      <div key={key} className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            {key
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </label>
          <span className="text-sm text-muted-foreground">
            {typeof value === "number" ? value.toFixed(2) : value}
          </span>
        </div>
        <Slider
          value={[Number(value)]}
          min={parameterConfig[key]?.min || 0}
          max={parameterConfig[key]?.max || 1}
          step={parameterConfig[key]?.step || 0.01}
          onValueChange={([newValue]) => {
            handleParameterChange(key, newValue);
          }}
        />
      </div>
    ));
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
          <Sliders className="h-5 w-5" />
          Transition Editor
        </CardTitle>
        <CardDescription>
          Create and manage custom transition presets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preset List */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Saved Presets</h3>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                  onClick={() => setCurrentPreset(preset)}
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">{preset.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {preset.effect_type_display}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicatePreset(preset.id);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Editor */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Input
                placeholder="Preset Name"
                value={currentPreset.name}
                onChange={(e) =>
                  setCurrentPreset((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />

              <Select
                value={currentPreset.effect_type}
                onValueChange={handleEffectTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Effect Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filter">Filter Fade</SelectItem>
                  <SelectItem value="echo">Echo Out</SelectItem>
                  <SelectItem value="reverb">Reverb Trail</SelectItem>
                  <SelectItem value="power_down">Power Down</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Duration</label>
                  <span className="text-sm text-muted-foreground">
                    {currentPreset.duration?.toFixed(1)}s
                  </span>
                </div>
                <Slider
                  value={[currentPreset.duration || 8]}
                  min={0.1}
                  max={16}
                  step={0.1}
                  onValueChange={([value]) =>
                    setCurrentPreset((prev) => ({
                      ...prev,
                      duration: value,
                    }))
                  }
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Effect Parameters</h4>
                {renderEffectParameters()}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={currentPreset.is_public}
                    onCheckedChange={(checked) =>
                      setCurrentPreset((prev) => ({
                        ...prev,
                        is_public: checked,
                      }))
                    }
                  />
                  <label className="text-sm">Make Public</label>
                </div>
                <Button onClick={handleSavePreset}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
