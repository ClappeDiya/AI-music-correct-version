"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/usetoast";
import { Loader2, Languages, Globe, ArrowLeftRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  settingsService,
  TranslingualPreference,
} from "@/services/settings.service";

export function TranslingualPreference() {
  const [preferences, setPreferences] = useState<TranslingualPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await settingsService.getTranslingualPreferences();
      setPreferences(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load translingual preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreference = async (
    id: number,
    updates: Partial<TranslingualPreference>,
  ) => {
    try {
      const updated = await settingsService.updateTranslingualPreference(
        id,
        updates,
      );
      setPreferences((prev) =>
        prev.map((pref) => (pref.id === id ? updated : pref)),
      );
      toast({
        title: "Success",
        description: "Preference updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preference",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Languages className="h-5 w-5" />
            <span>Translingual Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {preferences.map((pref) => (
            <div key={pref.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <Label>Language Pair</Label>
                </div>
                <Switch
                  checked={pref.active}
                  onCheckedChange={(checked) =>
                    handleUpdatePreference(pref.id, { active: checked })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <Select
                  value={pref.source_language}
                  onValueChange={(value) =>
                    handleUpdatePreference(pref.id, { source_language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex justify-center">
                  <ArrowLeftRight className="h-4 w-4" />
                </div>

                <Select
                  value={pref.target_language}
                  onValueChange={(value) =>
                    handleUpdatePreference(pref.id, { target_language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
