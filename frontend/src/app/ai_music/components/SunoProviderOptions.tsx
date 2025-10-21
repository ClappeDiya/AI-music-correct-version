"use client";

import { useState } from "react";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { saveSunoApiKey, clearSunoApiKey } from "@/services/api/suno_service";

interface SunoProviderOptionsProps {
  onChange: (options: SunoOptions) => void;
  initialValues?: Partial<SunoOptions>;
}

export interface SunoOptions {
  make_instrumental: boolean;
  vocals_only: boolean;
  custom_mode: boolean;
  music_style?: string;
  genre?: string;
  vocal_style?: string;
}

const DEFAULT_MUSIC_STYLES = [
  "pop", "rock", "electronic", "hip-hop", "jazz", "classical", 
  "ambient", "folk", "country", "r&b", "soul", "blues", "latin"
];

const DEFAULT_GENRES = [
  "pop", "rock", "electronic", "dance", "hip-hop", "jazz", "classical", 
  "ambient", "folk", "country", "r&b", "soul", "blues", "latin",
  "indie", "metal", "reggae", "funk", "punk", "disco"
];

const DEFAULT_VOCAL_STYLES = [
  "male", "female", "deep", "high", "raspy", "smooth", "powerful",
  "delicate", "operatic", "belting", "breathy", "growling"
];

export function SunoProviderOptions({ onChange, initialValues = {} }: SunoProviderOptionsProps) {
  const [makeInstrumental, setMakeInstrumental] = useState(initialValues.make_instrumental || false);
  const [vocalsOnly, setVocalsOnly] = useState(initialValues.vocals_only || false);
  const [customMode, setCustomMode] = useState(initialValues.custom_mode || false);
  const [musicStyle, setMusicStyle] = useState(initialValues.music_style || "");
  const [genre, setGenre] = useState(initialValues.genre || "");
  const [vocalStyle, setVocalStyle] = useState(initialValues.vocal_style || "");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Update parent component when options change
  const updateOptions = () => {
    const options: SunoOptions = {
      make_instrumental: makeInstrumental,
      vocals_only: vocalsOnly,
      custom_mode: customMode,
    };
    
    if (customMode) {
      if (musicStyle) options.music_style = musicStyle;
      if (genre) options.genre = genre;
      if (vocalStyle) options.vocal_style = vocalStyle;
    }
    
    onChange(options);
  };

  // Handle instrumental checkbox change
  const handleInstrumentalChange = (checked: boolean) => {
    // Can't be both instrumental-only and vocals-only
    let newVocalsOnly = vocalsOnly;
    if (checked && vocalsOnly) {
      newVocalsOnly = false;
      setVocalsOnly(false);
    }
    
    setMakeInstrumental(checked);
    onChange({
      make_instrumental: checked,
      vocals_only: newVocalsOnly,
      custom_mode: customMode,
      ...(customMode ? { 
        music_style: musicStyle || undefined,
        genre: genre || undefined,
        vocal_style: vocalStyle || undefined
      } : {})
    });
  };

  // Handle vocals-only checkbox change
  const handleVocalsOnlyChange = (checked: boolean) => {
    // Can't be both instrumental-only and vocals-only
    let newMakeInstrumental = makeInstrumental;
    if (checked && makeInstrumental) {
      newMakeInstrumental = false;
      setMakeInstrumental(false);
    }
    
    setVocalsOnly(checked);
    onChange({
      make_instrumental: newMakeInstrumental,
      vocals_only: checked,
      custom_mode: customMode,
      ...(customMode ? { 
        music_style: musicStyle || undefined,
        genre: genre || undefined,
        vocal_style: vocalStyle || undefined 
      } : {})
    });
  };
  
  // Handle custom mode checkbox change
  const handleCustomModeChange = (checked: boolean) => {
    setCustomMode(checked);
    onChange({
      make_instrumental: makeInstrumental,
      vocals_only: vocalsOnly,
      custom_mode: checked,
      ...(checked ? { 
        music_style: musicStyle || undefined,
        genre: genre || undefined,
        vocal_style: vocalStyle || undefined
      } : {})
    });
  };
  
  // Handle music style selection
  const handleMusicStyleChange = (value: string) => {
    setMusicStyle(value);
    if (customMode) {
      onChange({
        make_instrumental: makeInstrumental,
        vocals_only: vocalsOnly,
        custom_mode: true,
        music_style: value || undefined,
        genre: genre || undefined,
        vocal_style: vocalStyle || undefined
      });
    }
  };
  
  // Handle genre selection
  const handleGenreChange = (value: string) => {
    setGenre(value);
    if (customMode) {
      onChange({
        make_instrumental: makeInstrumental,
        vocals_only: vocalsOnly,
        custom_mode: true,
        music_style: musicStyle || undefined,
        genre: value || undefined,
        vocal_style: vocalStyle || undefined
      });
    }
  };
  
  // Handle vocal style selection
  const handleVocalStyleChange = (value: string) => {
    setVocalStyle(value);
    if (customMode) {
      onChange({
        make_instrumental: makeInstrumental,
        vocals_only: vocalsOnly,
        custom_mode: true,
        music_style: musicStyle || undefined,
        genre: genre || undefined,
        vocal_style: value || undefined
      });
    }
  };
  
  // Handle API key save
  const handleSaveApiKey = () => {
    if (apiKey) {
      saveSunoApiKey(apiKey);
      setApiKey("");
      setShowApiKeyInput(false);
    }
  };
  
  // Handle API key clear
  const handleClearApiKey = () => {
    clearSunoApiKey();
    setApiKey("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Suno Provider Options</h3>
          <p className="text-sm text-muted-foreground">
            Configure options for music generation using Suno AI
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="make-instrumental"
              checked={makeInstrumental}
              onCheckedChange={handleInstrumentalChange}
            />
            <Label htmlFor="make-instrumental">Generate instrumental-only track</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vocals-only"
              checked={vocalsOnly}
              onCheckedChange={handleVocalsOnlyChange}
            />
            <Label htmlFor="vocals-only">Generate vocals-only track</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="custom-mode"
              checked={customMode}
              onCheckedChange={handleCustomModeChange}
            />
            <Label htmlFor="custom-mode">Use custom mode (advanced options)</Label>
          </div>
        </div>
        
        {customMode && (
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
            <div className="space-y-2">
              <Label htmlFor="music-style">Music Style</Label>
              <Select 
                value={musicStyle} 
                onValueChange={handleMusicStyleChange}
              >
                <SelectTrigger id="music-style">
                  <SelectValue placeholder="Select music style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Use prompt)</SelectItem>
                  {DEFAULT_MUSIC_STYLES.map(style => (
                    <SelectItem key={style} value={style}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select 
                value={genre} 
                onValueChange={handleGenreChange}
              >
                <SelectTrigger id="genre">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Use prompt)</SelectItem>
                  {DEFAULT_GENRES.map(g => (
                    <SelectItem key={g} value={g}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vocal-style">Vocal Style</Label>
              <Select 
                value={vocalStyle} 
                onValueChange={handleVocalStyleChange}
              >
                <SelectTrigger id="vocal-style">
                  <SelectValue placeholder="Select vocal style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Use prompt)</SelectItem>
                  {DEFAULT_VOCAL_STYLES.map(style => (
                    <SelectItem key={style} value={style}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <div className="space-y-2 mt-4">
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            >
              {showApiKeyInput ? "Hide API Key Input" : "Configure API Key"}
            </Button>
            
            {showApiKeyInput && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleClearApiKey}
              >
                Clear Saved Key
              </Button>
            )}
          </div>
          
          {showApiKeyInput && (
            <div className="flex gap-2 mt-2">
              <Input
                type="password"
                placeholder="Enter Suno API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button
                type="button"
                onClick={handleSaveApiKey}
                disabled={!apiKey}
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 