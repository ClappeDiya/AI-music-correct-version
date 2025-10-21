"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/usetoast";
import {
  Loader2,
  Layers,
  Plus,
  Eye,
  EyeOff,
  Settings2,
  AlertTriangle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  settingsService,
  BehaviorTriggeredOverlay,
} from "@/services/settings.service";

export function BehaviorTriggeredOverlay() {
  const [overlays, setOverlays] = useState<BehaviorTriggeredOverlay[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOverlays();
  }, []);

  const loadOverlays = async () => {
    try {
      const data = await settingsService.getBehaviorOverlays();
      setOverlays(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load behavior overlays",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOverlay = async () => {
    try {
      const newOverlay = await settingsService.createBehaviorOverlay({
        name: "New Overlay",
        active: true,
        trigger_conditions: {},
        overlay_config: {},
      });
      setOverlays((prev) => [...prev, newOverlay]);
      toast({
        title: "Success",
        description: "New overlay created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create overlay",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (
    id: number,
    updates: Partial<BehaviorTriggeredOverlay>,
  ) => {
    try {
      const updated = await settingsService.updateBehaviorOverlay(id, updates);
      setOverlays((prev) => prev.map((o) => (o.id === id ? updated : o)));
      toast({
        title: "Success",
        description: "Overlay updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update overlay",
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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Behavior-Triggered Overlays</h2>
        <Button onClick={handleCreateOverlay}>
          <Plus className="h-4 w-4 mr-2" />
          Create Overlay
        </Button>
      </div>

      <div className="grid gap-6">
        {overlays.map((overlay) => (
          <Card key={overlay.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="h-5 w-5" />
                  <Input
                    value={overlay.name}
                    onChange={(e) =>
                      handleUpdate(overlay.id, { name: e.target.value })
                    }
                    className="h-7 px-2"
                  />
                </div>
                <Switch
                  checked={overlay.active}
                  onCheckedChange={(checked) =>
                    handleUpdate(overlay.id, { active: checked })
                  }
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Trigger Conditions</Label>
                {Object.entries(overlay.trigger_conditions).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span className="text-sm font-medium">{key}</span>
                      <Badge>{value}</Badge>
                    </div>
                  ),
                )}
              </div>

              <div className="space-y-4">
                <Label>Overlay Configuration</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Opacity</Label>
                    <Select
                      value={String(overlay.overlay_config.opacity || 1)}
                      onValueChange={(value) =>
                        handleUpdate(overlay.id, {
                          overlay_config: {
                            ...overlay.overlay_config,
                            opacity: Number(value),
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select opacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.25">25%</SelectItem>
                        <SelectItem value="0.5">50%</SelectItem>
                        <SelectItem value="0.75">75%</SelectItem>
                        <SelectItem value="1">100%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Animation</Label>
                    <Select
                      value={overlay.overlay_config.animation_type}
                      onValueChange={(value) =>
                        handleUpdate(overlay.id, {
                          overlay_config: {
                            ...overlay.overlay_config,
                            animation_type: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select animation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Handle preview
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Handle advanced settings
                  }}
                >
                  <Settings2 className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {overlays.length === 0 && (
        <Card className="p-8 flex flex-col items-center justify-center text-center">
          <Layers className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Overlays Created</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first behavior-triggered overlay to enhance user
            experience
          </p>
          <Button onClick={handleCreateOverlay}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Overlay
          </Button>
        </Card>
      )}
    </div>
  );
}
