"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  VoiceSettings,
  LanguageCapability,
} from "@/services/api/voice-settings";
import { Globe2, Waveform, Music, Settings2 } from "lucide-react";

interface LanguageFeaturesProps {
  settings: VoiceSettings;
  language: LanguageCapability;
  onUpdate: (updates: Partial<LanguageCapability>) => Promise<void>;
}

export function LanguageFeatures({
  settings,
  language,
  onUpdate,
}: LanguageFeaturesProps) {
  const [activeTab, setActiveTab] = useState("accent");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe2 className="h-5 w-5" />
          Advanced Language Settings - {language.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="accent">Accent Control</TabsTrigger>
            <TabsTrigger value="prosody">Prosody</TabsTrigger>
            <TabsTrigger value="style">Speaking Style</TabsTrigger>
          </TabsList>

          <TabsContent value="accent" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Regional Variation</label>
              <Slider
                value={[language.accent_strength]}
                onValueChange={([value]) =>
                  onUpdate({ accent_strength: value })
                }
                min={0}
                max={1}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Pronunciation Clarity
              </label>
              <Slider
                value={[language.pronunciation_clarity || 0.5]}
                onValueChange={([value]) =>
                  onUpdate({ pronunciation_clarity: value })
                }
                min={0}
                max={1}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dialect Influence</label>
              <Slider
                value={[language.dialect_influence || 0.5]}
                onValueChange={([value]) =>
                  onUpdate({ dialect_influence: value })
                }
                min={0}
                max={1}
                step={0.1}
              />
            </div>
          </TabsContent>

          <TabsContent value="prosody" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Speech Rate</label>
              <Slider
                value={[language.speech_rate || 1]}
                onValueChange={([value]) => onUpdate({ speech_rate: value })}
                min={0.5}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pitch Range</label>
              <Slider
                value={[language.pitch_range || 1]}
                onValueChange={([value]) => onUpdate({ pitch_range: value })}
                min={0.5}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Intonation Strength</label>
              <Slider
                value={[language.intonation_strength || 1]}
                onValueChange={([value]) =>
                  onUpdate({ intonation_strength: value })
                }
                min={0}
                max={2}
                step={0.1}
              />
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Formality Level</label>
              <Slider
                value={[language.formality_level || 0.5]}
                onValueChange={([value]) =>
                  onUpdate({ formality_level: value })
                }
                min={0}
                max={1}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expressiveness</label>
              <Slider
                value={[language.expressiveness || 0.5]}
                onValueChange={([value]) => onUpdate({ expressiveness: value })}
                min={0}
                max={1}
                step={0.1}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">
                  Gender Neutralization
                </label>
                <p className="text-sm text-muted-foreground">
                  Reduce gender-specific speech patterns
                </p>
              </div>
              <Switch
                checked={language.gender_neutral || false}
                onCheckedChange={(value) => onUpdate({ gender_neutral: value })}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
