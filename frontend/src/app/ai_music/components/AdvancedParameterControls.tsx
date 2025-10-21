"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface Track {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
}

interface AdvancedParameterControlsProps {
  onParameterChange: (params: any) => void;
  initialParameters?: any;
}

export default function AdvancedParameterControls({
  onParameterChange,
  initialParameters = {
    tempo: 120,
    emotionalTone: "neutral",
    complexity: "medium",
    tracks: [
      { id: "melody", name: "Melody", volume: 75, pan: 0, muted: false },
      { id: "harmony", name: "Harmony", volume: 65, pan: -20, muted: false },
      { id: "rhythm", name: "Rhythm", volume: 70, pan: 20, muted: false },
      { id: "bass", name: "Bass", volume: 80, pan: 0, muted: false },
    ],
  },
}) {
  const [parameters, setParameters] = useState(initialParameters);

  useEffect(() => {
    onParameterChange(parameters);
  }, [parameters, onParameterChange]);

  const updateTrack = (trackId: string, updates: Partial<Track>) => {
    setParameters((prev) => ({
      ...prev,
      tracks: prev.tracks.map((track) =>
        track.id === trackId ? { ...track, ...updates } : track,
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tempo (BPM)</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[parameters.tempo]}
                onValueChange={([value]) =>
                  setParameters((prev) => ({ ...prev, tempo: value }))
                }
                min={60}
                max={200}
                step={1}
                className="flex-1"
              />
              <span className="w-12 text-right">{parameters.tempo}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Emotional Tone</Label>
            <Select
              value={parameters.emotionalTone}
              onValueChange={(value) =>
                setParameters((prev) => ({ ...prev, emotionalTone: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="happy">Happy</SelectItem>
                <SelectItem value="sad">Sad</SelectItem>
                <SelectItem value="energetic">Energetic</SelectItem>
                <SelectItem value="calm">Calm</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Complexity</Label>
            <Select
              value={parameters.complexity}
              onValueChange={(value) =>
                setParameters((prev) => ({ ...prev, complexity: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="complex">Complex</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Track Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {parameters.tracks.map((track: Track) => (
              <div key={track.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>{track.name}</Label>
                  <div className="flex items-center space-x-2">
                    <Label>Mute</Label>
                    <Switch
                      checked={track.muted}
                      onCheckedChange={(checked) =>
                        updateTrack(track.id, { muted: checked })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Volume</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[track.volume]}
                      onValueChange={([value]) =>
                        updateTrack(track.id, { volume: value })
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                      disabled={track.muted}
                    />
                    <span className="w-12 text-right">{track.volume}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pan</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[track.pan]}
                      onValueChange={([value]) =>
                        updateTrack(track.id, { pan: value })
                      }
                      min={-100}
                      max={100}
                      step={1}
                      className="flex-1"
                      disabled={track.muted}
                    />
                    <span className="w-12 text-right">{track.pan}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
