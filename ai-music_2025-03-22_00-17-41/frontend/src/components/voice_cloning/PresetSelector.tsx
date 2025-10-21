"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/useToast";
import { VoicePreset, voicePresets } from "@/services/api/voice-presets";
import { Save, Search, Tag, Star } from "lucide-react";

interface PresetSelectorProps {
  onSelect: (preset: VoicePreset) => void;
  onSaveAsPreset: (parameters: VoicePreset["parameters"]) => void;
  currentParameters: VoicePreset["parameters"];
}

export function PresetSelector({
  onSelect,
  onSaveAsPreset,
  currentParameters,
}: PresetSelectorProps) {
  const [presets, setPresets] = useState<VoicePreset[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    VoicePreset["category"] | "all"
  >("all");
  const { toast } = useToast();

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const data = await voicePresets.getPresets();
      setPresets(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load presets",
        variant: "destructive",
      });
    }
  };

  const filteredPresets = presets.filter((preset) => {
    const matchesSearch =
      preset.name.toLowerCase().includes(search.toLowerCase()) ||
      preset.description.toLowerCase().includes(search.toLowerCase()) ||
      preset.tags.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || preset.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories: Array<{
    value: VoicePreset["category"] | "all";
    label: string;
  }> = [
    { value: "all", label: "All Presets" },
    { value: "natural", label: "Natural Voices" },
    { value: "character", label: "Character Voices" },
    { value: "effect", label: "Voice Effects" },
    { value: "custom", label: "Custom Presets" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Voice Presets
          </div>
          <Button
            variant="outline"
            onClick={() => onSaveAsPreset(currentParameters)}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Current as Preset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search presets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={
                  selectedCategory === category.value ? "default" : "outline"
                }
                onClick={() => setSelectedCategory(category.value)}
                size="sm"
              >
                {category.label}
              </Button>
            ))}
          </div>

          <ScrollArea className="h-[400px]">
            <div className="grid gap-2">
              {filteredPresets.map((preset) => (
                <Card
                  key={preset.id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => onSelect(preset)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{preset.name}</h3>
                        <Badge variant="secondary">{preset.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {preset.description}
                      </p>
                      <div className="flex gap-1">
                        {preset.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
