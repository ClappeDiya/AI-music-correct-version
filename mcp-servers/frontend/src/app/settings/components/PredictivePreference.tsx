"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Slider } from "@/components/ui/Slider";
import { useToast } from "@/components/ui/usetoast";
import { Loader2, Brain, Sparkles, History } from "lucide-react";
import {
  settingsService,
  PredictivePreferenceModel,
  PredictivePreferenceEvent,
} from "@/services/settings.service";

export function PredictivePreference() {
  const [model, setModel] = useState<PredictivePreferenceModel | null>(null);
  const [events, setEvents] = useState<PredictivePreferenceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [modelData, eventsData] = await Promise.all([
        settingsService.getPredictiveModel(),
        settingsService.getPredictiveEvents(),
      ]);
      setModel(modelData);
      setEvents(eventsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load predictive preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            <Brain className="h-5 w-5" />
            <span>Predictive Model Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Predictive Adjustments</Label>
              <p className="text-sm text-muted-foreground">
                Allow the system to automatically adjust settings based on your
                usage patterns
              </p>
            </div>
            <Switch
              checked={model?.enabled}
              onCheckedChange={(checked) => {
                // Handle model enable/disable
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Learning Rate</Label>
            <Slider
              value={[model?.learning_rate || 0.5]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(value) => {
                // Handle learning rate change
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Recent Predictions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="font-medium">
                    {event.applied_changes.description}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.applied_at).toLocaleString()}
                  </div>
                </div>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
