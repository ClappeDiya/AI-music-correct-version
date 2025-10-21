"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Slider } from '@/components/ui/Slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { musicEducationApi } from '@/services/music_education_api";
import { toast } from "sonner";
import { Brain, Save } from "lucide-react";

interface AdaptiveSettings {
  enabled: boolean;
  difficulty_level: number;
  learning_style: string;
  focus_areas: string[];
  practice_reminders: boolean;
  session_duration: number;
  ai_recommendations: {
    suggested_difficulty: number;
    recommended_focus: string[];
    practice_schedule: string;
    learning_style_match: string;
  };
}

const LEARNING_STYLES = [
  { value: "visual", label: "Visual Learning" },
  { value: "auditory", label: "Auditory Learning" },
  { value: "kinesthetic", label: "Kinesthetic Learning" },
  { value: "mixed", label: "Mixed Approach" },
];

const FOCUS_AREAS = [
  { value: "technique", label: "Technique" },
  { value: "theory", label: "Music Theory" },
  { value: "rhythm", label: "Rhythm" },
  { value: "sight_reading", label: "Sight Reading" },
  { value: "ear_training", label: "Ear Training" },
  { value: "composition", label: "Composition" },
];

export function AdaptiveCurriculumSection() {
  const [settings, setSettings] = useState<AdaptiveSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await musicEducationApi.getAdaptiveSettings();
      setSettings(data);
    } catch (error) {
      toast.error("Failed to load adaptive settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      await musicEducationApi.updateAdaptiveSettings(settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Adaptive Learning Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Adaptive Learning</Label>
              <div className="text-sm text-muted-foreground">
                Automatically adjust your learning experience based on performance
              </div>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enabled: checked })
              }
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Slider
                value={[settings.difficulty_level]}
                onValueChange={([value]) =>
                  setSettings({ ...settings, difficulty_level: value })
                }
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Beginner</span>
                <span>Advanced</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Learning Style</Label>
              <Select
                value={settings.learning_style}
                onValueChange={(value) =>
                  setSettings({ ...settings, learning_style: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a learning style" />
                </SelectTrigger>
                <SelectContent>
                  {LEARNING_STYLES.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Focus Areas</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {FOCUS_AREAS.map((area) => (
                  <Button
                    key={area.value}
                    variant={
                      settings.focus_areas.includes(area.value)
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setSettings({
                        ...settings,
                        focus_areas: settings.focus_areas.includes(area.value)
                          ? settings.focus_areas.filter((a) => a !== area.value)
                          : [...settings.focus_areas, area.value],
                      })
                    }
                    className="h-auto py-2"
                  >
                    {area.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Practice Reminders</Label>
                <div className="text-sm text-muted-foreground">
                  Receive notifications for recommended practice sessions
                </div>
              </div>
              <Switch
                checked={settings.practice_reminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, practice_reminders: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Session Duration (minutes)</Label>
              <Slider
                value={[settings.session_duration]}
                onValueChange={([value]) =>
                  setSettings({ ...settings, session_duration: value })
                }
                min={15}
                max={120}
                step={15}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>15 min</span>
                <span>120 min</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Suggested Difficulty Level</Label>
            <div className="text-sm text-muted-foreground">
              Based on your recent performance, we recommend a difficulty level of{" "}
              {settings.ai_recommendations.suggested_difficulty}/10
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recommended Focus Areas</Label>
            <div className="flex flex-wrap gap-2">
              {settings.ai_recommendations.recommended_focus.map((focus) => (
                <div
                  key={focus}
                  className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                >
                  {FOCUS_AREAS.find((a) => a.value === focus)?.label || focus}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recommended Practice Schedule</Label>
            <div className="text-sm text-muted-foreground">
              {settings.ai_recommendations.practice_schedule}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Learning Style Match</Label>
            <div className="text-sm text-muted-foreground">
              {settings.ai_recommendations.learning_style_match}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 

