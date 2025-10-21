"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/usetoast";
import { Loader2, Plus, Clock, Settings2 } from "lucide-react";
import {
  settingsService,
  ContextualProfile,
} from "@/services/settings.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

export function ContextualSettings() {
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await settingsService.getContextualProfiles();
      setProfiles(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contextual profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    try {
      const newProfile = await settingsService.createContextualProfile({
        context_type: "time_based",
        settings: {},
        active_timeframe: {
          start: "09:00",
          end: "17:00",
        },
      });
      setProfiles((prev) => [...prev, newProfile]);
      toast({
        title: "Success",
        description: "New contextual profile created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create profile",
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
      <div className="flex justify-end">
        <Button onClick={handleCreateProfile}>
          <Plus className="h-4 w-4 mr-2" />
          Add Profile
        </Button>
      </div>

      {profiles.map((profile) => (
        <Card key={profile.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Profile: {profile.context_type}</span>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <Input
                    type="time"
                    value={profile.active_timeframe.start}
                    onChange={(e) => {
                      // Handle time change
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <Input
                    type="time"
                    value={profile.active_timeframe.end}
                    onChange={(e) => {
                      // Handle time change
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Context Type</Label>
              <Select
                value={profile.context_type}
                onValueChange={(value) => {
                  // Handle context type change
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select context type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time_based">Time Based</SelectItem>
                  <SelectItem value="location_based">Location Based</SelectItem>
                  <SelectItem value="activity_based">Activity Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
