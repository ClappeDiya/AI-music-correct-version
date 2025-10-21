"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/useToast";
import { Settings2 } from "lucide-react";
import {
  groupEmotionService,
  EmotionalPreference,
} from "@/services/groupEmotionService";
import { cn } from "@/lib/utils";

interface EmotionalPreferencesProps {
  sessionId: string;
  userId: string;
  className?: string;
}

export function EmotionalPreferences({
  sessionId,
  userId,
  className,
}: EmotionalPreferencesProps) {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<EmotionalPreference | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const prefs = await groupEmotionService.getEmotionalPreference(
          sessionId,
          userId,
        );
        setPreferences(prefs);
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
        // Create default preferences if none exist
        try {
          const newPrefs = await groupEmotionService.createEmotionalPreference({
            user: userId,
            session: sessionId,
            emotion_weight: 1.0,
            prefer_emotional_sync: true,
            emotion_influence_radius: 0.5,
          });
          setPreferences(newPrefs);
        } catch (createError) {
          console.error("Failed to create preferences:", createError);
          toast({
            title: "Error",
            description: "Failed to load or create emotional preferences",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [sessionId, userId, toast]);

  const handlePreferenceUpdate = async (
    updates: Partial<EmotionalPreference>,
  ) => {
    if (!preferences) return;

    try {
      const updatedPrefs = await groupEmotionService.updateEmotionalPreference(
        preferences.id,
        updates,
      );
      setPreferences(updatedPrefs);
      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
    } catch (error) {
      console.error("Failed to update preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Emotional Sync Settings
        </CardTitle>
        <CardDescription>
          Customize how your emotions influence and are influenced by the group
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Emotional Sync Toggle */}
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="sync-toggle" className="flex flex-col space-y-1">
            <span>Emotional Sync</span>
            <span className="font-normal text-sm text-muted-foreground">
              Allow music to match group emotions
            </span>
          </Label>
          <Switch
            id="sync-toggle"
            checked={preferences.prefer_emotional_sync}
            onCheckedChange={(checked) =>
              handlePreferenceUpdate({ prefer_emotional_sync: checked })
            }
          />
        </div>

        {/* Emotion Weight Slider */}
        <div className="space-y-2">
          <Label className="flex flex-col space-y-1">
            <span>Emotional Influence</span>
            <span className="font-normal text-sm text-muted-foreground">
              How much your emotions affect the group
            </span>
          </Label>
          <Slider
            value={[preferences.emotion_weight]}
            min={0}
            max={2}
            step={0.1}
            onValueChange={([value]) =>
              handlePreferenceUpdate({ emotion_weight: value })
            }
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Less influence</span>
            <span>Normal</span>
            <span>More influence</span>
          </div>
        </div>

        {/* VR Influence Radius Slider */}
        <div className="space-y-2">
          <Label className="flex flex-col space-y-1">
            <span>VR Influence Radius</span>
            <span className="font-normal text-sm text-muted-foreground">
              Distance-based emotional influence in VR
            </span>
          </Label>
          <Slider
            value={[preferences.emotion_influence_radius]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([value]) =>
              handlePreferenceUpdate({ emotion_influence_radius: value })
            }
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Nearby only</span>
            <span>Medium range</span>
            <span>Full room</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
