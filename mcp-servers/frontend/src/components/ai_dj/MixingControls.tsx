import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { useToast } from "@/components/ui/useToast";
import {
  Music4,
  Sliders,
  Save,
  BarChart as Waveform,
  ArrowLeftRight as Transition
} from "lucide-react";
import { Track } from '@/types/AiDj';
import { aiDjApi } from '@/lib/api/services/AiDj';

interface MixingPreferences {
  fadeLength: number;
  beatAlignment: boolean;
  transitionType: 'smooth' | 'cut' | 'echo' | 'filter';
  bpmSync: boolean;
  autoGain: boolean;
}

interface MixingControlsProps {
  currentTrack: Track | null;
  nextTrack: Track | null;
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
}

export function MixingControls({
  currentTrack,
  nextTrack,
  onTransitionStart,
  onTransitionEnd,
}: MixingControlsProps) {
  const [preferences, setPreferences] = useState<MixingPreferences>({
    fadeLength: 8,
    beatAlignment: true,
    transitionType: 'smooth',
    bpmSync: true,
    autoGain: true,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await aiDjApi.getSession(undefined);
      if (response.mixing_preferences) {
        setPreferences(response.mixing_preferences);
      }
    } catch (error) {
      console.error('Failed to load mixing preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      await aiDjApi.updateSession(undefined, {
        mixing_preferences: preferences,
      });
      toast({
        title: "Success",
        description: "Mixing preferences saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    }
  };

  const handleTransition = async () => {
    if (!currentTrack || !nextTrack) return;

    try {
      setIsTransitioning(true);
      if (onTransitionStart) onTransitionStart();

      // Call backend transition endpoint
      await aiDjApi.createTransition({
        from_track: currentTrack.id,
        to_track: nextTrack.id,
        preferences,
      });

      if (onTransitionEnd) onTransitionEnd();
      toast({
        title: "Success",
        description: "Transition complete",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute transition",
        variant: "destructive",
      });
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sliders className="h-5 w-5 mr-2" />
          Mixing Controls
        </CardTitle>
        <CardDescription>
          Customize your transition preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Transition Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Transition Type</label>
            <Select
              value={preferences.transitionType}
              onValueChange={(value: 'smooth' | 'cut' | 'echo' | 'filter') =>
                setPreferences({ ...preferences, transitionType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transition type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smooth">Smooth Crossfade</SelectItem>
                <SelectItem value="cut">Hard Cut</SelectItem>
                <SelectItem value="echo">Echo Out</SelectItem>
                <SelectItem value="filter">Filter Sweep</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fade Length */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fade Length (seconds)</label>
            <div className="flex items-center space-x-4">
              <Waveform className="h-4 w-4" />
              <Slider
                value={[preferences.fadeLength]}
                onValueChange={([value]) =>
                  setPreferences({ ...preferences, fadeLength: value })
                }
                min={0}
                max={16}
                step={1}
                className="flex-1"
              />
              <span className="w-12 text-sm">{preferences.fadeLength}s</span>
            </div>
          </div>

          {/* Beat Alignment */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Beat Alignment</label>
              <p className="text-sm text-muted-foreground">
                Sync transitions to the beat
              </p>
            </div>
            <Switch
              checked={preferences.beatAlignment}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, beatAlignment: checked })
              }
            />
          </div>

          {/* BPM Sync */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">BPM Sync</label>
              <p className="text-sm text-muted-foreground">
                Match tempo between tracks
              </p>
            </div>
            <Switch
              checked={preferences.bpmSync}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, bpmSync: checked })
              }
            />
          </div>

          {/* Auto Gain */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Auto Gain</label>
              <p className="text-sm text-muted-foreground">
                Automatically balance volume levels
              </p>
            </div>
            <Switch
              checked={preferences.autoGain}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, autoGain: checked })
              }
            />
          </div>

          {/* Track Info */}
          {(currentTrack || nextTrack) && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Music4 className="h-4 w-4" />
                <span className="text-sm font-medium">Current Mix</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Current Track</p>
                  <p className="text-muted-foreground">
                    {currentTrack?.title || 'None'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Next Track</p>
                  <p className="text-muted-foreground">
                    {nextTrack?.title || 'None'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={savePreferences}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
            <Button
              onClick={handleTransition}
              disabled={!currentTrack || !nextTrack || isTransitioning}
            >
              <Transition className="h-4 w-4 mr-2" />
              {isTransitioning ? 'Transitioning...' : 'Start Transition'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 

