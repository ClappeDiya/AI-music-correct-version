"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/usetoast";
import { Loader2, Clock, Calendar, Timer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  settingsService,
  EphemeralEventPreference,
} from "@/services/settings.service";

export function EphemeralEventPreference() {
  const [preferences, setPreferences] = useState<EphemeralEventPreference[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await settingsService.getEphemeralPreferences();
      setPreferences(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load ephemeral preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (
    id: number,
    updates: Partial<EphemeralEventPreference>,
  ) => {
    try {
      const updated = await settingsService.updateEphemeralPreference(
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
            <Clock className="h-5 w-5" />
            <span>Ephemeral Event Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {preferences.map((pref) => (
              <div key={pref.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{pref.event_type}</span>
                  </div>
                  <Switch
                    checked={pref.active}
                    onCheckedChange={(checked) =>
                      handleUpdate(pref.id, { active: checked })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4" />
                      <Select
                        value={String(pref.duration_minutes)}
                        onValueChange={(value) =>
                          handleUpdate(pref.id, {
                            duration_minutes: Number(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={pref.priority}
                      onValueChange={(value) =>
                        handleUpdate(pref.id, { priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Next scheduled:{" "}
                  {pref.next_scheduled
                    ? new Date(pref.next_scheduled).toLocaleString()
                    : "Not scheduled"}
                </div>
              </div>
            ))}

            {preferences.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No ephemeral preferences configured
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
