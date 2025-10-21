"use client";

import { Card } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/useToast";
import { MoodService } from "@/lib/api/services/mood";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useCache } from "@/hooks/UseCache";
import { SliderSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";

interface AdvancedSettings {
  intensity: number;
  complexity: number;
  tempo: number;
  emotionalCurve: any | null;
}

// Extended MoodService with additional methods for advanced settings
const extendedMoodService = {
  ...MoodService,
  // Mock implementations that will need to be replaced with actual API calls
  getAdvancedSettings: () => 
    Promise.resolve({ 
      data: { 
        intensity: 50, 
        complexity: 50, 
        tempo: 120, 
        emotionalCurve: null 
      } as AdvancedSettings 
    }),
  saveAdvancedSettings: (settings: AdvancedSettings) => 
    Promise.resolve({ data: settings }),
  getEmotionalCurve: () => 
    Promise.resolve({ data: [] }) // Replace with actual curve data structure
};

export function AdvancedControls() {
  const { toast } = useToast();
  const { getAdvancedSettings, saveAdvancedSettings, getEmotionalCurve } = extendedMoodService;

  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<AdvancedSettings>({
    intensity: 50,
    complexity: 50,
    tempo: 120,
    emotionalCurve: null
  });

  // Use cache for settings and curve data
  const {
    data: settings,
    isLoading: isLoadingSettings,
    update: updateSettings,
  } = useCache<AdvancedSettings>("advanced-settings", () =>
    getAdvancedSettings().then((response) => response.data)
  );

  const {
    data: emotionalCurve,
    isLoading: isLoadingCurve,
    update: updateCurve,
  } = useCache<any>("emotional-curve", () =>
    getEmotionalCurve().then((response) => response.data)
  );

  // Initialize local settings from fetched data
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        intensity: settings.intensity,
        complexity: settings.complexity,
        tempo: settings.tempo,
        emotionalCurve: settings.emotionalCurve
      });
    }
  }, [settings]);

  // Update emotional curve when it loads
  useEffect(() => {
    if (emotionalCurve) {
      setLocalSettings((prev) => ({
        ...(prev || { intensity: 50, complexity: 50, tempo: 120 }),
        emotionalCurve: emotionalCurve
      }));
    }
  }, [emotionalCurve]);

  const handleSave = async () => {
    if (!localSettings) return;
    
    setIsSaving(true);
    try {
      const result = await saveAdvancedSettings({
        intensity: localSettings.intensity,
        complexity: localSettings.complexity,
        tempo: localSettings.tempo,
        emotionalCurve: localSettings.emotionalCurve
      });
      
      // Refresh data in cache
      updateSettings(result.data);
      
      toast({
        title: "Settings saved",
        description: "Your advanced music settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (
    setting: keyof AdvancedSettings,
    value: number
  ) => {
    setLocalSettings((prev) => {
      if (!prev) return {
        intensity: setting === "intensity" ? value : 50,
        complexity: setting === "complexity" ? value : 50,
        tempo: setting === "tempo" ? value : 120,
        emotionalCurve: null
      };
      
      return {
        ...prev,
        [setting]: value,
      };
    });
  };

  const hasChanges =
    settings &&
    localSettings &&
    (settings.intensity !== localSettings.intensity ||
      settings.complexity !== localSettings.complexity ||
      settings.tempo !== localSettings.tempo);

  if (isLoadingSettings) {
    return (
      <div className="space-y-4 p-4">
        <SliderSkeleton />
        <SliderSkeleton />
        <SliderSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Advanced Controls</h3>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          size="sm"
        >
          {isSaving ? "Saving..." : "Save Changes"}
          {!isSaving && <Save className="ml-2 h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-8">
        <Card className="p-4">
          <div className="space-y-6">
            {localSettings && (
              <>
                <div className="space-y-2">
                  <Label>Emotional Intensity</Label>
                  <Slider
                    value={[localSettings.intensity]}
                    onValueChange={([value]) =>
                      handleSettingChange("intensity", value)
                    }
                    max={100}
                    step={1}
                  />
                  <p className="text-sm text-muted-foreground">
                    {localSettings.intensity}%
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Musical Complexity</Label>
                  <Slider
                    value={[localSettings.complexity]}
                    onValueChange={([value]) =>
                      handleSettingChange("complexity", value)
                    }
                    max={100}
                    step={1}
                  />
                  <p className="text-sm text-muted-foreground">
                    {localSettings.complexity}%
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Tempo (BPM)</Label>
                  <Slider
                    value={[localSettings.tempo]}
                    onValueChange={([value]) =>
                      handleSettingChange("tempo", value)
                    }
                    min={60}
                    max={180}
                    step={1}
                  />
                  <p className="text-sm text-muted-foreground">
                    {localSettings.tempo} BPM
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Emotional curve visualization would go here */}
        <Card className="p-4">
          <h4 className="text-md font-medium mb-4">Emotional Journey</h4>
          {isLoadingCurve ? (
            <ChartSkeleton />
          ) : (
            <div className="h-48 bg-muted rounded-md flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Emotional curve visualization
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
