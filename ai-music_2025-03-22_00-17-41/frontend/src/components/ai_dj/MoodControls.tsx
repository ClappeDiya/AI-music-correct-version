import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { useToast } from "@/components/ui/useToast";
import {
  Smile,
  Frown,
  Meh,
  Sun,
  Moon,
  Activity,
  Heart,
  Music,
  RefreshCcw,
} from "lucide-react";
import { aiDjApi } from '@/lib/api/services/AiDj';

interface MoodControlsProps {
  sessionId?: number;
  onMoodChange?: (moodSettings: MoodSettings) => void;
}

interface MoodSettings {
  happiness: number;
  energy: number;
  intensity: number;
  stress: number;
  selectedMood: string;
}

export function MoodControls({ sessionId, onMoodChange }: MoodControlsProps) {
  const [moodSettings, setMoodSettings] = useState<MoodSettings>({
    happiness: 50,
    energy: 50,
    intensity: 50,
    stress: 30,
    selectedMood: 'neutral',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  const { toast } = useToast();

  // Track skip patterns for automatic mood detection
  const [skipHistory, setSkipHistory] = useState<Array<{ timestamp: number }>>([]);
  const SKIP_THRESHOLD = 3; // Number of skips within timeframe to indicate dissatisfaction
  const SKIP_TIMEFRAME = 5 * 60 * 1000; // 5 minutes in milliseconds

  useEffect(() => {
    // Clean up old skip history
    const now = Date.now();
    const recentSkips = skipHistory.filter(
      skip => now - skip.timestamp < SKIP_TIMEFRAME
    );
    setSkipHistory(recentSkips);

    // Detect rapid skipping
    if (autoDetectEnabled && recentSkips.length >= SKIP_THRESHOLD) {
      handleDissatisfactionDetected();
    }
  }, [skipHistory, autoDetectEnabled]);

  const handleDissatisfactionDetected = async () => {
    // Adjust mood settings based on detected dissatisfaction
    const newSettings = {
      ...moodSettings,
      happiness: Math.max(moodSettings.happiness - 10, 0),
      stress: Math.min(moodSettings.stress + 10, 100),
    };
    
    await updateMoodSettings(newSettings);
    toast({
      title: "Mood Adjusted",
      description: "Detected changes in listening patterns. Adjusting recommendations.",
    });
  };

  const updateMoodSettings = async (newSettings: MoodSettings) => {
    if (!sessionId) return;

    setIsUpdating(true);
    try {
      await aiDjApi.updateSession(sessionId, {
        mood_settings: {
          ...newSettings,
          timestamp: new Date().toISOString(),
        },
      });

      setMoodSettings(newSettings);
      if (onMoodChange) {
        onMoodChange(newSettings);
      }

      toast({
        title: "Settings Updated",
        description: "Your mood preferences have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update mood settings",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTrackSkipped = () => {
    setSkipHistory([...skipHistory, { timestamp: Date.now() }]);
  };

  const handleMoodSelect = (mood: string) => {
    const newSettings = { ...moodSettings, selectedMood: mood };
    switch (mood) {
      case 'happy':
        newSettings.happiness = 80;
        newSettings.energy = 70;
        newSettings.stress = 20;
        break;
      case 'neutral':
        newSettings.happiness = 50;
        newSettings.energy = 50;
        newSettings.stress = 30;
        break;
      case 'sad':
        newSettings.happiness = 30;
        newSettings.energy = 40;
        newSettings.stress = 40;
        break;
    }
    updateMoodSettings(newSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mood Controls</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAutoDetectEnabled(!autoDetectEnabled)}
            title={autoDetectEnabled ? "Auto-detect enabled" : "Auto-detect disabled"}
          >
            <RefreshCcw className={`h-4 w-4 ${autoDetectEnabled ? "text-green-500" : "text-muted-foreground"}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          Adjust your mood preferences or let AI detect changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Quick Mood Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Mood Select</label>
            <div className="flex justify-center space-x-4">
              <Button
                variant={moodSettings.selectedMood === 'happy' ? "default" : "outline"}
                onClick={() => handleMoodSelect('happy')}
              >
                <Smile className="h-4 w-4 mr-2" />
                Happy
              </Button>
              <Button
                variant={moodSettings.selectedMood === 'neutral' ? "default" : "outline"}
                onClick={() => handleMoodSelect('neutral')}
              >
                <Meh className="h-4 w-4 mr-2" />
                Neutral
              </Button>
              <Button
                variant={moodSettings.selectedMood === 'sad' ? "default" : "outline"}
                onClick={() => handleMoodSelect('sad')}
              >
                <Frown className="h-4 w-4 mr-2" />
                Sad
              </Button>
            </div>
          </div>

          {/* Fine-tuning Controls */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Happiness Level</label>
              <div className="flex items-center space-x-4">
                <Frown className="h-4 w-4" />
                <Slider
                  value={[moodSettings.happiness]}
                  onValueChange={([value]) =>
                    updateMoodSettings({ ...moodSettings, happiness: value })
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Smile className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Energy Level</label>
              <div className="flex items-center space-x-4">
                <Moon className="h-4 w-4" />
                <Slider
                  value={[moodSettings.energy]}
                  onValueChange={([value]) =>
                    updateMoodSettings({ ...moodSettings, energy: value })
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Sun className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Intensity</label>
              <div className="flex items-center space-x-4">
                <Heart className="h-4 w-4" />
                <Slider
                  value={[moodSettings.intensity]}
                  onValueChange={([value]) =>
                    updateMoodSettings({ ...moodSettings, intensity: value })
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Activity className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Stress Level</label>
              <div className="flex items-center space-x-4">
                <Music className="h-4 w-4" />
                <Slider
                  value={[moodSettings.stress]}
                  onValueChange={([value]) =>
                    updateMoodSettings({ ...moodSettings, stress: value })
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Activity className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 

