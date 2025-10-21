"use client";

import React from "react";
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
import { Switch } from "@/components/ui/Switch";
import { Slider } from "@/components/ui/Slider";
import { useToast } from "@/components/ui/useToast";
import {
  Box,
  Lightbulb,
  Users,
  Sparkles,
  Save,
  Undo,
  Camera,
} from "lucide-react";
import { useVRDJStore, vrDjService } from "@/services/vrDjService";
import { cn } from "@/lib/utils";

interface EnvironmentEditorProps {
  className?: string;
}

export function EnvironmentEditor({ className }: EnvironmentEditorProps) {
  const { toast } = useToast();
  const environment = useVRDJStore((state) => state.environment);
  const session = useVRDJStore((state) => state.session);

  const handlePresetChange = async (preset: string) => {
    if (!environment?.id || !session?.id) return;

    try {
      await vrDjService.applyEnvironmentPreset(environment.id, preset);
      toast({
        title: "Success",
        description: "Environment preset applied successfully",
      });
    } catch (error) {
      console.error("Failed to apply preset:", error);
      toast({
        title: "Error",
        description: "Failed to apply environment preset",
        variant: "destructive",
      });
    }
  };

  const handleSaveEnvironment = async () => {
    if (!environment || !session?.id) return;

    try {
      if (environment.id) {
        await vrDjService.updateEnvironment(environment.id, environment);
      } else {
        await vrDjService.createEnvironment({
          ...environment,
          session: session.id,
        });
      }

      toast({
        title: "Success",
        description: "Environment saved successfully",
      });
    } catch (error) {
      console.error("Failed to save environment:", error);
      toast({
        title: "Error",
        description: "Failed to save environment",
        variant: "destructive",
      });
    }
  };

  if (!environment || !session) {
    return null;
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-5 w-5" />
          Environment Editor
        </CardTitle>
        <CardDescription>Customize your VR DJ environment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <Input
                placeholder="Environment Name"
                value={environment.name}
                onChange={(e) => {
                  useVRDJStore.setState({
                    environment: { ...environment, name: e.target.value },
                  });
                }}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Lighting Preset</label>
                <Select
                  value={environment.lighting_preset}
                  onValueChange={handlePresetChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lighting preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambient">Ambient</SelectItem>
                    <SelectItem value="dynamic">Dynamic</SelectItem>
                    <SelectItem value="reactive">Music Reactive</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Crowd Simulation</span>
                </div>
                <Switch
                  checked={environment.crowd_simulation}
                  onCheckedChange={(checked) => {
                    useVRDJStore.setState({
                      environment: {
                        ...environment,
                        crowd_simulation: checked,
                      },
                    });
                  }}
                />
              </div>
            </div>

            {/* Visual Effects */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Visual Effects
              </h3>

              <div className="space-y-4">
                {Object.entries(environment.visual_effects).map(
                  ([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          {key
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ")}
                        </label>
                        <span className="text-sm text-muted-foreground">
                          {typeof value === "number" ? value.toFixed(2) : value}
                        </span>
                      </div>
                      {typeof value === "number" && (
                        <Slider
                          value={[value]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={([newValue]) => {
                            useVRDJStore.setState({
                              environment: {
                                ...environment,
                                visual_effects: {
                                  ...environment.visual_effects,
                                  [key]: newValue,
                                },
                              },
                            });
                          }}
                        />
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Camera Position
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {["x", "y", "z"].map((axis) => (
                <div key={axis} className="space-y-2">
                  <label className="text-sm font-medium">
                    {axis.toUpperCase()} Position
                  </label>
                  <Input
                    type="number"
                    value={environment.scene_data.camera_position[axis]}
                    onChange={(e) => {
                      useVRDJStore.setState({
                        environment: {
                          ...environment,
                          scene_data: {
                            ...environment.scene_data,
                            camera_position: {
                              ...environment.scene_data.camera_position,
                              [axis]: parseFloat(e.target.value) || 0,
                            },
                          },
                        },
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                // Reset to last saved state
                if (environment.id) {
                  vrDjService.getSession(session.id);
                }
              }}
            >
              <Undo className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSaveEnvironment}>
              <Save className="h-4 w-4 mr-2" />
              Save Environment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
