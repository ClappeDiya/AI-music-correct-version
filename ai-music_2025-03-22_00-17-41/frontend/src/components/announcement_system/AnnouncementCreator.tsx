"use client";

import React, { useState } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { useToast } from "@/components/ui/useToast";
import {
  MessageSquarePlus,
  Volume2,
  VolumeX,
  Languages,
  Mic2,
  Wand2,
  Clock,
  Save,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementCreatorProps {
  sessionId: number;
  onAnnouncementCreate?: (announcement: any) => void;
  className?: string;
}

export function AnnouncementCreator({
  sessionId,
  onAnnouncementCreate,
  className,
}: AnnouncementCreatorProps) {
  const { currentLanguage, supportedLanguages } = useLanguageStore();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("casual");
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPreview, setIsPreview] = useState(false);
  const [useBackgroundMusic, setUseBackgroundMusic] = useState(false);

  const handlePreview = async () => {
    try {
      setIsPreview(true);
      const response = await fetch(
        `/api/sessions/${sessionId}/announcements/preview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voice_style: voiceStyle,
            speed,
            pitch,
            language: currentLanguage,
            use_background_music: useBackgroundMusic,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to generate preview");

      const blob = await response.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.onended = () => setIsPreview(false);
      await audio.play();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to preview announcement",
      });
      setIsPreview(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice_style: voiceStyle,
          speed,
          pitch,
          language: currentLanguage,
          use_background_music: useBackgroundMusic,
        }),
      });

      if (!response.ok) throw new Error("Failed to create announcement");

      const data = await response.json();
      onAnnouncementCreate?.(data);

      toast({
        title: "Success",
        description: "Announcement created successfully",
      });

      setText("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create announcement",
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5" />
          Create Announcement
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          {supportedLanguages.find((l) => l.code === currentLanguage)?.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base sm:text-sm">Announcement Text</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your announcement text..."
              className="min-h-[100px] sm:min-h-[150px]"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base sm:text-sm">
                <Mic2 className="h-4 w-4" />
                Voice Style
              </Label>
              <Select value={voiceStyle} onValueChange={setVoiceStyle}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select voice style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="calm">Calm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TooltipProvider>
              <div className="space-y-2 px-2">
                <Label className="flex items-center gap-2 text-base sm:text-sm">
                  <Wand2 className="h-4 w-4" />
                  Speed
                </Label>
                <div className="px-2 py-4 sm:py-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Slider
                        value={[speed]}
                        onValueChange={([value]) => setSpeed(value)}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="touch-none"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Speed: {speed}x</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="space-y-2 px-2">
                <Label className="flex items-center gap-2 text-base sm:text-sm">
                  <Volume2 className="h-4 w-4" />
                  Pitch
                </Label>
                <div className="px-2 py-4 sm:py-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Slider
                        value={[pitch]}
                        onValueChange={([value]) => setPitch(value)}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="touch-none"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pitch: {pitch}x</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>

            <div className="flex items-center space-x-2 py-2">
              <Switch
                id="bgm"
                checked={useBackgroundMusic}
                onCheckedChange={setUseBackgroundMusic}
              />
              <Label htmlFor="bgm" className="text-base sm:text-sm">
                Use Background Music
              </Label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!text || isPreview}
              className="w-full sm:w-auto gap-2"
            >
              {isPreview ? (
                <>
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  Playing...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  Preview
                </>
              )}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!text}
              className="w-full sm:w-auto gap-2"
            >
              <Save className="h-4 w-4" />
              Create
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
