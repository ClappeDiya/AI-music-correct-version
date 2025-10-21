"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/useToast";
import {
  Cube,
  Headphones,
  HandMetal,
  Sliders,
  Wand2,
  Music,
  Mic,
  Settings,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface DAWControl {
  id: string;
  type: "knob" | "slider" | "button";
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
}

export default function CompositionSpaces() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [environment, setEnvironment] = useState("studio");
  const [dawControls, setDawControls] = useState<DAWControl[]>([
    {
      id: "volume",
      type: "slider",
      value: 75,
      min: 0,
      max: 100,
      step: 1,
      label: "Master Volume",
    },
    {
      id: "pan",
      type: "knob",
      value: 0,
      min: -100,
      max: 100,
      step: 1,
      label: "Pan",
    },
    {
      id: "reverb",
      type: "slider",
      value: 30,
      min: 0,
      max: 100,
      step: 1,
      label: "Reverb",
    },
  ]);

  // Handle control changes
  const handleControlChange = (id: string, value: number) => {
    setDawControls((prev) =>
      prev.map((control) =>
        control.id === id ? { ...control, value } : control,
      ),
    );

    // Sync with backend
    api
      .post("/api/vr/daw-controls", {
        controlId: id,
        value,
        environment,
        immersiveMode,
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to sync control changes",
          variant: "destructive",
        });
      });
  };

  // Toggle immersive mode
  const toggleImmersiveMode = () => {
    setImmersiveMode(!immersiveMode);
    toast({
      title: immersiveMode
        ? "Exiting Immersive Mode"
        : "Entering Immersive Mode",
      description: immersiveMode
        ? "Returning to standard view"
        : "Switching to VR environment",
    });
  };

  // Save current state
  const saveState = async () => {
    try {
      await api.post("/api/vr/save-state", {
        controls: dawControls,
        environment,
        immersiveMode,
      });
      toast({
        title: "State Saved",
        description: "Your current settings have been saved",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save state",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Interactive Composition Space</h1>
        <div className="flex items-center gap-4">
          <Button
            variant={immersiveMode ? "default" : "outline"}
            onClick={toggleImmersiveMode}
          >
            <Cube className="mr-2 h-4 w-4" />
            {immersiveMode ? "Exit VR" : "Enter VR"}
          </Button>
          <Button onClick={saveState}>
            <Save className="mr-2 h-4 w-4" />
            Save State
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3D DAW Controls */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Sliders className="mr-2" /> DAW Controls
          </h2>
          <div className="space-y-6">
            {dawControls.map((control) => (
              <div key={control.id} className="space-y-2">
                <label className="text-sm font-medium">{control.label}</label>
                {control.type === "slider" ? (
                  <Slider
                    value={[control.value]}
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    onValueChange={([value]) =>
                      handleControlChange(control.id, value)
                    }
                  />
                ) : control.type === "knob" ? (
                  <div className="h-24 w-24 relative">
                    {/* Custom knob visualization */}
                    <div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      style={{
                        transform: `rotate(${(control.value / (control.max - control.min)) * 360}deg)`,
                      }}
                    />
                    <Slider
                      value={[control.value]}
                      min={control.min}
                      max={control.max}
                      step={control.step}
                      onValueChange={([value]) =>
                        handleControlChange(control.id, value)
                      }
                    />
                  </div>
                ) : null}
                <span className="text-xs text-muted-foreground">
                  {control.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Environment Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Settings className="mr-2" /> Environment
          </h2>
          <Tabs defaultValue="studio" onValueChange={setEnvironment}>
            <TabsList className="grid grid-cols-3 gap-4">
              <TabsTrigger value="studio">Studio</TabsTrigger>
              <TabsTrigger value="concert-hall">Concert Hall</TabsTrigger>
              <TabsTrigger value="abstract">Abstract</TabsTrigger>
            </TabsList>
            <TabsContent value="studio" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Professional studio environment with acoustic treatment and
                near-field monitoring.
              </p>
            </TabsContent>
            <TabsContent value="concert-hall" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Large concert hall with natural reverb and stage positioning.
              </p>
            </TabsContent>
            <TabsContent value="abstract" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Abstract space with unique visual and acoustic properties.
              </p>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
