"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/useToast";
import {
  VoiceSettings,
  LanguageCapability,
  voiceSettings,
} from "@/services/api/voice-settings";
import { Globe, Plus, X } from "lucide-react";

interface LanguageManagerProps {
  voiceId: number;
  onUpdate: () => void;
}

export function LanguageManager({ voiceId, onUpdate }: LanguageManagerProps) {
  const [settings, setSettings] = useState<VoiceSettings | null>(null);
  const [newLanguage, setNewLanguage] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [voiceId]);

  const loadSettings = async () => {
    try {
      const data = await voiceSettings.getSettings(voiceId);
      setSettings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load voice settings",
        variant: "destructive",
      });
    }
  };

  const handleAddLanguage = async () => {
    if (!newLanguage) return;

    try {
      await voiceSettings.addLanguage(voiceId, {
        code: newLanguage,
        name: getLanguageName(newLanguage),
        accent_strength: 1,
        is_native: false,
      });
      await loadSettings();
      setNewLanguage("");
      toast({
        title: "Language Added",
        description: "New language capability added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add language",
        variant: "destructive",
      });
    }
  };

  const handleRemoveLanguage = async (languageCode: string) => {
    try {
      await voiceSettings.removeLanguage(voiceId, languageCode);
      await loadSettings();
      toast({
        title: "Language Removed",
        description: "Language capability removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove language",
        variant: "destructive",
      });
    }
  };

  const handleAccentStrengthChange = async (
    language: LanguageCapability,
    strength: number,
  ) => {
    if (!settings) return;

    try {
      await voiceSettings.updateSettings(voiceId, {
        capabilities: {
          ...settings.capabilities,
          languages: settings.capabilities.languages.map((l) =>
            l.code === language.code ? { ...l, accent_strength: strength } : l,
          ),
        },
      });
      await loadSettings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update accent strength",
        variant: "destructive",
      });
    }
  };

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language Capabilities
          </div>
          <div className="flex items-center gap-2">
            <Select value={newLanguage} onValueChange={setNewLanguage}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Add language..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddLanguage}
              disabled={!newLanguage}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {settings.capabilities.languages.map((language) => (
            <div
              key={language.code}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{language.name}</h3>
                  {language.is_native && (
                    <Badge variant="secondary">Native</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <label className="text-sm">Proficiency</label>
                    <Progress value={language.proficiency * 100} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm">Accent Strength</label>
                    <Slider
                      value={[language.accent_strength]}
                      onValueChange={([value]) =>
                        handleAccentStrengthChange(language, value)
                      }
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-[200px]"
                    />
                  </div>
                </div>
              </div>
              {!language.is_native && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveLanguage(language.code)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  // Add more languages as needed
];

function getLanguageName(code: string): string {
  return AVAILABLE_LANGUAGES.find((lang) => lang.code === code)?.name || code;
}
