"use client";

import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/useToast";
import {
  Activity,
  Clock,
  Music,
  Plus,
  Save,
  Trash2,
  Wand2,
} from "lucide-react";
import {
  emotionalJourneyService,
  EmotionalJourney,
  JourneyPoint,
} from "@/services/emotionalJourneyService";
import { cn } from "@/lib/utils";

interface JourneyPlannerProps {
  sessionId: string;
  className?: string;
}

export function JourneyPlanner({ sessionId, className }: JourneyPlannerProps) {
  const { toast } = useToast();
  const [journey, setJourney] = useState<EmotionalJourney | null>(null);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<JourneyPoint[]>([]);

  useEffect(() => {
    const loadJourney = async () => {
      try {
        const data = await emotionalJourneyService.getJourney(sessionId);
        setJourney(data);
        setPoints(data.points);
      } catch (error) {
        console.error("Failed to load journey:", error);
        toast({
          title: "Error",
          description: "Failed to load emotional journey",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadJourney();
  }, [sessionId, toast]);

  const handleAddPoint = () => {
    const newPoint: Partial<JourneyPoint> = {
      position: points.length,
      energy_level: 50,
      mood: "neutral",
      duration: 5,
      transition_type: "smooth",
    };
    setPoints([...points, newPoint as JourneyPoint]);
  };

  const handleRemovePoint = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
  };

  const handleUpdatePoint = (index: number, updates: Partial<JourneyPoint>) => {
    const newPoints = [...points];
    newPoints[index] = { ...newPoints[index], ...updates };
    setPoints(newPoints);
  };

  const handleSave = async () => {
    try {
      if (!journey) {
        const newJourney = await emotionalJourneyService.createJourney({
          session: sessionId,
          name: "Custom Journey",
          description: "A custom emotional journey",
          total_duration: points.reduce((sum, p) => sum + p.duration, 0),
          points,
        });
        setJourney(newJourney);
      } else {
        const updatedJourney = await emotionalJourneyService.updateJourney(
          journey.id,
          {
            points,
            total_duration: points.reduce((sum, p) => sum + p.duration, 0),
          },
        );
        setJourney(updatedJourney);
      }
      toast({
        title: "Success",
        description: "Journey saved successfully",
      });
    } catch (error) {
      console.error("Failed to save journey:", error);
      toast({
        title: "Error",
        description: "Failed to save journey",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Emotional Journey Planner
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Journey
          </Button>
        </CardTitle>
        <CardDescription>
          Plan your emotional journey by adding points and adjusting their
          parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {points.map((point, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg"
            >
              <div className="space-y-2">
                <Label>Energy Level</Label>
                <Slider
                  value={[point.energy_level]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) =>
                    handleUpdatePoint(index, { energy_level: value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Mood</Label>
                <Select
                  value={point.mood}
                  onValueChange={(value) =>
                    handleUpdatePoint(index, { mood: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="focused">Focused</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  value={point.duration}
                  onChange={(e) =>
                    handleUpdatePoint(index, {
                      duration: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Transition</Label>
                <Select
                  value={point.transition_type}
                  onValueChange={(value) =>
                    handleUpdatePoint(index, { transition_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smooth">Smooth</SelectItem>
                    <SelectItem value="sudden">Sudden</SelectItem>
                    <SelectItem value="gradual">Gradual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => handleRemovePoint(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button onClick={handleAddPoint} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Journey Point
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
