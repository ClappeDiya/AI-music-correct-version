"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { VoiceSettings, VoiceEffects } from "@/services/api/voice-settings";
import { Waveform, Music, Settings2 } from "lucide-react";

interface EffectControlsProps {
  settings: VoiceSettings;
  onUpdate: (updates: Partial<VoiceEffects>) => Promise<void>;
}

export function EffectControls({ settings, onUpdate }: EffectControlsProps) {
  const [activeTab, setActiveTab] = useState("reverb");

  // Initialize default effects values to prevent errors
  const defaultReverb = { enabled: false, roomSize: 0.5 };
  const reverb = settings.effects?.reverb || defaultReverb;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Voice Effects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="reverb">Reverb</TabsTrigger>
            <TabsTrigger value="chorus">Chorus</TabsTrigger>
            <TabsTrigger value="harmonizer">Harmonizer</TabsTrigger>
            <TabsTrigger value="compressor">Compressor</TabsTrigger>
            <TabsTrigger value="delay">Delay</TabsTrigger>
            <TabsTrigger value="distortion">Distortion</TabsTrigger>
            <TabsTrigger value="filter">Filter</TabsTrigger>
            <TabsTrigger value="modulation">Modulation</TabsTrigger>
          </TabsList>

          <TabsContent value="reverb" className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Reverb</label>
              <Switch
                checked={reverb.enabled}
                onCheckedChange={(value) =>
                  onUpdate({
                    reverb: { ...reverb, enabled: value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Room Size</label>
              <Slider
                value={[reverb.roomSize]}
                onValueChange={([value]) =>
                  onUpdate({
                    reverb: { ...reverb, roomSize: value },
                  })
                }
                min={0}
                max={1}
                step={0.01}
              />
            </div>

            {/* Add more reverb controls */}
          </TabsContent>

          <TabsContent value="chorus" className="space-y-4">
            {/* Add chorus controls */}
          </TabsContent>

          <TabsContent value="harmonizer" className="space-y-4">
            {/* Add harmonizer controls */}
          </TabsContent>

          <TabsContent value="compressor" className="space-y-4">
            {/* Add compressor controls */}
          </TabsContent>

          <TabsContent value="delay" className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Delay</label>
              <Switch
                checked={settings.effects?.delay?.enabled || false}
                onCheckedChange={(value) =>
                  onUpdate({
                    delay: {
                      ...settings.effects?.delay,
                      enabled: value,
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Slider
                value={[settings.effects?.delay?.time || 0.3]}
                onValueChange={([value]) =>
                  onUpdate({
                    delay: {
                      ...settings.effects?.delay,
                      time: value,
                    },
                  })
                }
                min={0}
                max={1}
                step={0.01}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Feedback</label>
              <Slider
                value={[settings.effects?.delay?.feedback || 0.3]}
                onValueChange={([value]) =>
                  onUpdate({
                    delay: {
                      ...settings.effects?.delay,
                      feedback: value,
                    },
                  })
                }
                min={0}
                max={0.9}
                step={0.01}
              />
            </div>
          </TabsContent>

          <TabsContent value="filter" className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Filter</label>
              <Switch
                checked={settings.effects?.filter?.enabled || false}
                onCheckedChange={(value) =>
                  onUpdate({
                    filter: {
                      ...settings.effects?.filter,
                      enabled: value,
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cutoff Frequency</label>
              <Slider
                value={[settings.effects?.filter?.cutoff || 1000]}
                onValueChange={([value]) =>
                  onUpdate({
                    filter: {
                      ...settings.effects?.filter,
                      cutoff: value,
                    },
                  })
                }
                min={20}
                max={20000}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Resonance</label>
              <Slider
                value={[settings.effects?.filter?.resonance || 1]}
                onValueChange={([value]) =>
                  onUpdate({
                    filter: {
                      ...settings.effects?.filter,
                      resonance: value,
                    },
                  })
                }
                min={0}
                max={20}
                step={0.1}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
