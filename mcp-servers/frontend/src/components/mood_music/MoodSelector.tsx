"use client";

import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useQuery } from "@tanstack/react-query";
import { Wand2, Bookmark, Globe } from "lucide-react";
import { CustomMoodSelector } from "./CustomMoodSelector";
import { api } from "@/lib/api";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { MoodService } from "@/lib/api/services/mood";

interface Mood {
  id: number;
  name: string;
  description: string;
  color?: string;
  user_id?: string;
}

interface MoodSelectorProps {
  selectedMood: Mood | null;
  intensity: number;
  onMoodSelect: (mood: Mood) => void;
  onIntensityChange: (value: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function MoodSelector({
  selectedMood,
  intensity,
  onMoodSelect,
  onIntensityChange,
  onGenerate,
  isGenerating,
}: MoodSelectorProps) {
  // Fetch available moods
  const { data: moods = [] } = useQuery<Mood[]>({
    queryKey: ["moods"],
    queryFn: async () => {
      const response = await MoodService.getMoods();
      return response.data;
    },
  });

  const systemMoods = moods.filter((mood) => !mood.user_id);
  const userMoods = moods.filter((mood) => mood.user_id);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Label>Select Mood</Label>
        <Select
          value={selectedMood?.id.toString()}
          onValueChange={(value) => {
            const mood = moods.find((m) => m.id.toString() === value);
            if (mood) onMoodSelect(mood);
          }}
        >
          <SelectTrigger className="h-9 sm:h-10">
            <SelectValue placeholder="Choose a mood..." />
          </SelectTrigger>
          <SelectContent>
            {systemMoods.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  System Moods
                </div>
                {systemMoods.map((mood) => (
                  <SelectItem
                    key={mood.id}
                    value={mood.id.toString()}
                    className="flex items-center"
                  >
                    <div className="flex items-center gap-2">
                      {mood.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: mood.color }}
                        />
                      )}
                      {mood.name}
                    </div>
                  </SelectItem>
                ))}
              </>
            )}

            {userMoods.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground mt-2">
                  <Bookmark className="h-4 w-4" />
                  Your Moods
                </div>
                {userMoods.map((mood) => (
                  <SelectItem
                    key={mood.id}
                    value={mood.id.toString()}
                    className="flex items-center"
                  >
                    <div className="flex items-center gap-2">
                      {mood.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: mood.color }}
                        />
                      )}
                      {mood.name}
                      <Badge variant="outline" className="text-xs">
                        Personal
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
        {selectedMood?.description && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            {selectedMood.description}
          </p>
        )}
      </div>

      <CustomMoodSelector />

      <div className="space-y-2">
        <Label>Intensity</Label>
        <div className="relative">
          <Slider
            value={[intensity]}
            onValueChange={([value]) => onIntensityChange(value)}
            min={0}
            max={1}
            step={0.01}
            className="py-4"
          />
          {selectedMood?.color && (
            <div
              className="absolute inset-0 pointer-events-none opacity-10 rounded-full"
              style={{ backgroundColor: selectedMood.color }}
            />
          )}
        </div>
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span>Subtle</span>
          <span>Intense</span>
        </div>
      </div>

      <Button
        onClick={onGenerate}
        disabled={!selectedMood || isGenerating}
        className="w-full h-9 sm:h-10 text-sm sm:text-base"
        style={{
          backgroundColor: selectedMood?.color,
          borderColor: selectedMood?.color,
        }}
      >
        <Wand2 className="mr-2 h-4 w-4" />
        {isGenerating ? "Generating..." : "Generate Music"}
      </Button>
    </div>
  );
}
