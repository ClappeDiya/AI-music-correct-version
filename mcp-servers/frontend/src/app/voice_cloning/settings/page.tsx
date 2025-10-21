"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useToast } from "@/components/ui/useToast";
import { LanguageFeatures } from "@/components/voice_cloning/LanguageFeatures";
import { LanguageManager } from "@/components/voice_cloning/LanguageManager";
import { EffectControls } from "@/components/voice_cloning/EffectControls";
import { ConsentManager } from "@/components/voice_cloning/ConsentManager";
import { VoiceModel, voiceCloning } from "@/services/api/voice_cloning";
import { voiceSettings } from "@/services/api/voice-settings";
import { Loader2, Globe2, Music, Shield, Settings2 } from "lucide-react";

// Default values to ensure proper structure
const DEFAULT_EFFECTS = {
  reverb: { enabled: false, roomSize: 0.5 },
  delay: { enabled: false, time: 0.3, feedback: 0.3 },
  filter: { enabled: false, cutoff: 1000, resonance: 1 },
  chorus: { enabled: false, rate: 1.5, depth: 0.7 },
  compressor: { enabled: false, threshold: -24, ratio: 3 },
  harmonizer: { enabled: false, pitch: 0 },
  distortion: { enabled: false, amount: 0.5 },
  modulation: { enabled: false, type: 'tremolo', frequency: 4, depth: 0.5 }
};

export default function SettingsPage() {
  const [models, setModels] = useState<VoiceModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const response = await voiceCloning.getVoiceModels();
      
      // Ensure all models have proper structure with defaults
      const modelsWithDefaults = response.data.map(model => ({
        ...model,
        settings: {
          ...model.settings,
          effects: model.settings?.effects || DEFAULT_EFFECTS
        }
      }));
      
      setModels(modelsWithDefaults);
      if (modelsWithDefaults.length > 0) {
        setSelectedModelId(modelsWithDefaults[0].id.toString());
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load models",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsUpdate = async () => {
    toast({
      title: "Success",
      description: "Settings updated successfully",
    });
    await loadModels();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const selectedModel = models.find(m => m.id.toString() === selectedModelId);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Select
          value={selectedModelId}
          onValueChange={setSelectedModelId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem
                key={model.id}
                value={model.id.toString()}
              >
                Model #{model.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedModel && (
        <Tabs defaultValue="languages">
          <TabsList>
            <TabsTrigger value="languages" className="flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              Languages
            </TabsTrigger>
            <TabsTrigger value="effects" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Effects
            </TabsTrigger>
            <TabsTrigger value="consent" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Consent
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="languages">
              <div className="grid gap-6">
                <LanguageManager
                  voiceId={selectedModel.id}
                  onUpdate={handleSettingsUpdate}
                />
                {selectedModel.supported_languages.map(lang => (
                  <LanguageFeatures
                    key={lang}
                    settings={selectedModel.settings}
                    language={selectedModel.language_capabilities[lang]}
                    onUpdate={(updates) => {
                      // Handle language feature updates
                      voiceSettings.updateSettings(selectedModel.id, {
                        capabilities: {
                          languages: selectedModel.settings.capabilities.languages.map(l => 
                            l.code === lang ? { ...l, ...updates } : l
                          )
                        }
                      }).then(handleSettingsUpdate);
                    }}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="effects">
              <EffectControls
                settings={selectedModel.settings}
                onUpdate={(updates) => {
                  // Handle effects updates
                  voiceSettings.updateEffects(selectedModel.id, updates)
                    .then(handleSettingsUpdate);
                }}
              />
            </TabsContent>

            <TabsContent value="consent">
              <ConsentManager
                voiceId={selectedModel.id}
                onConsentChange={() => handleSettingsUpdate()}
                onDataDeleted={loadModels}
              />
            </TabsContent>

            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add advanced settings controls here */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
} 

