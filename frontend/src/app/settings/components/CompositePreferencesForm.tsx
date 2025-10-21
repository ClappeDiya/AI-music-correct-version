import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/usetoast";

interface Preference {
  key: string;
  label: string;
  type: "number" | "boolean" | "string";
  value: any;
}

interface CompositePreferencesFormProps {
  preferences: Preference[];
  onChange: (preferences: Preference[]) => void;
}

export function CompositePreferencesForm({
  preferences,
  onChange,
}: CompositePreferencesFormProps) {
  const { toast } = useToast();

  const handleChange = (key: string, value: any) => {
    const updated = preferences.map((p) =>
      p.key === key ? { ...p, value } : p,
    );
    onChange(updated);
  };

  const renderPreferenceInput = (pref: Preference) => {
    switch (pref.type) {
      case "number":
        return (
          <Slider
            value={[pref.value]}
            onValueChange={([val]: [number]) => handleChange(pref.key, val)}
            min={0}
            max={100}
            step={1}
          />
        );
      case "boolean":
        return (
          <Switch
            checked={pref.value}
            onCheckedChange={(val) => handleChange(pref.key, val)}
          />
        );
      case "string":
        return (
          <Input
            value={pref.value}
            onChange={(e) => handleChange(pref.key, e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {preferences.map((pref) => (
        <div key={pref.key} className="space-y-2">
          <Label>{pref.label}</Label>
          {renderPreferenceInput(pref)}
        </div>
      ))}
    </div>
  );
}
