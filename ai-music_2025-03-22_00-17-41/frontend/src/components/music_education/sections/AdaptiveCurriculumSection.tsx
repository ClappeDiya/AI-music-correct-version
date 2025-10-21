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
import { AdaptiveSettings, musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";
import { Brain, Save } from "lucide-react";

export function AdaptiveCurriculumSection() {
  const [settings, setSettings] = useState<AdaptiveSettings>({
    enabled: false,
    difficultyAdjustment: 0.5,
    learningStyle: "balanced",
    focusAreas: [],
    adaptationSpeed: "medium",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await musicEducationApi.getAdaptiveSettings();
      setSettings(response.data);
    } catch (error) {
      console.error("Failed to load adaptive settings:", error);
      toast.error("Failed to load adaptive settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await musicEducationApi.updateAdaptiveSettings(settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Adaptive Learning Settings</h2>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="adaptive-enabled">Enable Adaptive Learning</Label>
              <Switch
                id="adaptive-enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Difficulty Adjustment</Label>
              <Slider
                value={[settings.difficultyAdjustment * 100]}
                onValueChange={([value]) =>
                  setSettings({
                    ...settings,
                    difficultyAdjustment: value / 100,
                  })
                }
                min={0}
                max={100}
                step={1}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Easier</span>
                <span>Harder</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adaptation-speed">Adaptation Speed</Label>
              <Select
                value={settings.adaptationSpeed}
                onValueChange={(value) =>
                  setSettings({ ...settings, adaptationSpeed: value })
                }
              >
                <SelectTrigger id="adaptation-speed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="learning-style">Learning Style</Label>
              <Select
                value={settings.learningStyle}
                onValueChange={(value) =>
                  setSettings({ ...settings, learningStyle: value })
                }
              >
                <SelectTrigger id="learning-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual</SelectItem>
                  <SelectItem value="auditory">Auditory</SelectItem>
                  <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Focus Areas</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "theory",
                  "technique",
                  "rhythm",
                  "sight-reading",
                  "ear-training",
                  "composition",
                ].map((area) => (
                  <div
                    key={area}
                    className="flex items-center space-x-2"
                  >
                    <Switch
                      id={`focus-${area}`}
                      checked={settings.focusAreas.includes(area)}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          focusAreas: checked
                            ? [...settings.focusAreas, area]
                            : settings.focusAreas.filter((a) => a !== area),
                        })
                      }
                    />
                    <Label htmlFor={`focus-${area}`}>
                      {area.charAt(0).toUpperCase() + area.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Based on your current settings and learning progress, the AI system
            will adjust your curriculum to focus on {settings.focusAreas.join(", ")}{" "}
            with a {settings.learningStyle} learning style approach. The difficulty
            will be adjusted {settings.difficultyAdjustment < 0.5 ? "down" : "up"}{" "}
            to match your performance, and changes will be applied at a{" "}
            {settings.adaptationSpeed} pace.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 

