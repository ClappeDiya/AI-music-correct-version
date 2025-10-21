"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Waves,
  TrendingUp,
  TrendingDown,
  Clock,
  Music2,
  Save,
  Play,
} from "lucide-react";
import { useToast } from "@/components/ui/useToast";
import { cn } from "@/lib/utils";

interface JourneyPoint {
  energy: number;
  mood: string;
  duration: number;
}

interface EmotionalJourneyPlannerProps {
  onJourneyStart: (journey: JourneyPoint[]) => void;
  className?: string;
}

export function EmotionalJourneyPlanner({
  onJourneyStart,
  className,
}: EmotionalJourneyPlannerProps) {
  const { toast } = useToast();
  const [journeyPoints, setJourneyPoints] = useState<JourneyPoint[]>([
    { energy: 30, mood: "calm", duration: 15 },
    { energy: 80, mood: "energetic", duration: 30 },
    { energy: 40, mood: "relaxed", duration: 15 },
  ]);

  const moodOptions = [
    { value: "calm", label: "Calm" },
    { value: "energetic", label: "Energetic" },
    { value: "relaxed", label: "Relaxed" },
    { value: "focused", label: "Focused" },
    { value: "uplifting", label: "Uplifting" },
  ];

  const handleEnergyChange = (index: number, value: number[]) => {
    const newPoints = [...journeyPoints];
    newPoints[index] = { ...newPoints[index], energy: value[0] };
    setJourneyPoints(newPoints);
  };

  const handleMoodChange = (index: number, value: string) => {
    const newPoints = [...journeyPoints];
    newPoints[index] = { ...newPoints[index], mood: value };
    setJourneyPoints(newPoints);
  };

  const handleDurationChange = (index: number, value: number[]) => {
    const newPoints = [...journeyPoints];
    newPoints[index] = { ...newPoints[index], duration: value[0] };
    setJourneyPoints(newPoints);
  };

  const handleAddPoint = () => {
    if (journeyPoints.length >= 5) {
      toast({
        title: "Maximum Points Reached",
        description: "You can have up to 5 journey points",
        variant: "destructive",
      });
      return;
    }

    const lastPoint = journeyPoints[journeyPoints.length - 1];
    setJourneyPoints([...journeyPoints, { ...lastPoint }]);
  };

  const handleRemovePoint = (index: number) => {
    if (journeyPoints.length <= 2) {
      toast({
        title: "Minimum Points Required",
        description: "You need at least 2 journey points",
        variant: "destructive",
      });
      return;
    }

    const newPoints = journeyPoints.filter((_, i) => i !== index);
    setJourneyPoints(newPoints);
  };

  const startJourney = () => {
    onJourneyStart(journeyPoints);
    toast({
      title: "Journey Started",
      description: "Your emotional music journey has begun",
    });
  };

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5" />
          Emotional Journey Planner
        </CardTitle>
        <CardDescription>
          Design your perfect emotional music journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {journeyPoints.map((point, index) => (
            <div
              key={index}
              className="space-y-4 p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Journey Point {index + 1}
                </h3>
                {journeyPoints.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePoint(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Energy Level</label>
                    <span className="text-sm text-muted-foreground">
                      {point.energy}%
                    </span>
                  </div>
                  <Slider
                    value={[point.energy]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => handleEnergyChange(index, value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Mood</label>
                  <Select
                    value={point.mood}
                    onValueChange={(value) => handleMoodChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {moodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Duration (minutes)</label>
                    <span className="text-sm text-muted-foreground">
                      {point.duration} min
                    </span>
                  </div>
                  <Slider
                    value={[point.duration]}
                    min={5}
                    max={60}
                    step={5}
                    onValueChange={(value) =>
                      handleDurationChange(index, value)
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleAddPoint}
              className="gap-2"
              disabled={journeyPoints.length >= 5}
            >
              <TrendingUp className="h-4 w-4" />
              Add Point
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Save className="h-4 w-4" />
                Save Template
              </Button>
              <Button onClick={startJourney} className="gap-2">
                <Play className="h-4 w-4" />
                Start Journey
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
