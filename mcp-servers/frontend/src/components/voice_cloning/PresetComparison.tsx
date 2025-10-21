"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { VoicePreset } from "@/services/api/voice-presets";
import { CompareIcon } from "lucide-react";
import { ParameterVisualization } from "./parameter-visualization";

interface PresetComparisonProps {
  presets: VoicePreset[];
  onSelect: (preset: VoicePreset) => void;
}

export function PresetComparison({ presets, onSelect }: PresetComparisonProps) {
  const [preset1Id, setPreset1Id] = useState<string>("");
  const [preset2Id, setPreset2Id] = useState<string>("");

  const preset1 = presets.find((p) => p.id.toString() === preset1Id);
  const preset2 = presets.find((p) => p.id.toString() === preset2Id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CompareIcon className="h-5 w-5" />
            Preset Comparison
          </div>
          <div className="flex items-center gap-2">
            <Select value={preset1Id} onValueChange={setPreset1Id}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select first preset" />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id.toString()}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={preset2Id} onValueChange={setPreset2Id}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select second preset" />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id.toString()}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {preset1 && preset2 ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">{preset1.name}</h3>
              <ParameterVisualization parameters={preset1.parameters} />
              {preset1.metadata.emotion && (
                <EmotionVisualization emotion={preset1.metadata.emotion} />
              )}
            </div>
            <div>
              <h3 className="font-medium mb-2">{preset2.name}</h3>
              <ParameterVisualization parameters={preset2.parameters} />
              {preset2.metadata.emotion && (
                <EmotionVisualization emotion={preset2.metadata.emotion} />
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Select two presets to compare
          </p>
        )}
      </CardContent>
    </Card>
  );
}
