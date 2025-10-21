"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Headphones, Cube, Settings2 } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Slider } from '@/components/ui/Slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/useToast";
import { futureCapabilitiesApi } from '@/lib/api/future_capabilities";
import { VREnvironmentConfig } from '@/lib/types/future_capabilities";

export default function VRMusicExperiences() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");
  const [environments, setEnvironments] = useState<VREnvironmentConfig[]>([]);
  const [spatialAudioSettings, setSpatialAudioSettings] = useState({
    volume: 75,
    reverbLevel: 50,
    bassBoost: false,
    surroundAngle: 180,
  });

  useEffect(() => {
    loadUserEnvironments();
  }, []);

  const loadUserEnvironments = async () => {
    try {
      const response = await futureCapabilitiesApi.vrEnvironments.list();
      setEnvironments(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load VR environments",
        variant: "destructive",
      });
    }
  };

  const handleImmersiveModeToggle = async () => {
    if (!selectedEnvironment && !immersiveMode) {
      toast({
        title: "Select Environment",
        description: "Please select a VR environment first",
        variant: "default",
      });
      return;
    }
    setImmersiveMode(!immersiveMode);
  };

  const handleEnvironmentChange = async (value: string) => {
    setSelectedEnvironment(value);
    const environment = environments.find((env) => env.id.toString() === value);
    if (environment?.spatial_audio_settings) {
      setSpatialAudioSettings({
        ...spatialAudioSettings,
        ...environment.spatial_audio_settings,
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">VR Music Experiences</h1>
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Audio Settings</SheetTitle>
                <SheetDescription>
                  Configure your spatial audio preferences
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Master Volume</label>
                  <Slider
                    value={[spatialAudioSettings.volume]}
                    onValueChange={(value) =>
                      setSpatialAudioSettings({
                        ...spatialAudioSettings,
                        volume: value[0],
                      })
                    }
                    max={100}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reverb Level</label>
                  <Slider
                    value={[spatialAudioSettings.reverbLevel]}
                    onValueChange={(value) =>
                      setSpatialAudioSettings({
                        ...spatialAudioSettings,
                        reverbLevel: value[0],
                      })
                    }
                    max={100}
                    step={1}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Bass Boost</label>
                  <Switch
                    checked={spatialAudioSettings.bassBoost}
                    onCheckedChange={(checked) =>
                      setSpatialAudioSettings({
                        ...spatialAudioSettings,
                        bassBoost: checked,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Surround Angle</label>
                  <Slider
                    value={[spatialAudioSettings.surroundAngle]}
                    onValueChange={(value) =>
                      setSpatialAudioSettings({
                        ...spatialAudioSettings,
                        surroundAngle: value[0],
                      })
                    }
                    max={360}
                    step={10}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center space-x-2">
            <Headphones className={immersiveMode ? "text-primary" : "text-muted-foreground"} />
            <Switch
              checked={immersiveMode}
              onCheckedChange={handleImmersiveModeToggle}
            />
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Environment Selection</h2>
            <Select value={selectedEnvironment} onValueChange={handleEnvironmentChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select VR Environment" />
              </SelectTrigger>
              <SelectContent>
                {environments.map((env) => (
                  <SelectItem key={env.id} value={env.id.toString()}>
                    {env.environment_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Current Environment</h2>
            {selectedEnvironment && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Cube className="text-primary" />
                  <span className="text-sm">
                    {environments.find((env) => env.id.toString() === selectedEnvironment)?.environment_name}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {immersiveMode ? "Immersive Mode Active" : "Standard Mode"}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {immersiveMode && selectedEnvironment && (
        <Card className="p-6 bg-primary/5">
          <h2 className="text-xl font-semibold mb-4">Immersive Controls</h2>
          <Tabs defaultValue="position">
            <TabsList>
              <TabsTrigger value="position">Position</TabsTrigger>
              <TabsTrigger value="rotation">Rotation</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
            </TabsList>
            <TabsContent value="position" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">X Position</label>
                  <Slider defaultValue={[0]} min={-10} max={10} step={0.1} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Y Position</label>
                  <Slider defaultValue={[0]} min={-10} max={10} step={0.1} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Z Position</label>
                <Slider defaultValue={[0]} min={-10} max={10} step={0.1} />
              </div>
            </TabsContent>
            <TabsContent value="rotation" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Yaw</label>
                  <Slider defaultValue={[0]} min={-180} max={180} step={1} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pitch</label>
                  <Slider defaultValue={[0]} min={-90} max={90} step={1} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Roll</label>
                  <Slider defaultValue={[0]} min={-180} max={180} step={1} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="effects" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Room Size</label>
                  <Slider defaultValue={[50]} max={100} step={1} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reflection</label>
                  <Slider defaultValue={[30]} max={100} step={1} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}



