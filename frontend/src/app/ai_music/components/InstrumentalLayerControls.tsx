"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/usetoast";
import { VolumeIcon, SpeakerXIcon } from "lucide-react";
import { updateTrackParameters } from "@/app/api/ai-music-generation";

interface InstrumentalLayer {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
}

interface InstrumentalLayerControlsProps {
  trackId: string;
  layers: InstrumentalLayer[];
  onLayerUpdate: (layers: InstrumentalLayer[]) => void;
}

export function InstrumentalLayerControls({
  trackId,
  layers,
  onLayerUpdate,
}: InstrumentalLayerControlsProps) {
  const [localLayers, setLocalLayers] = useState<InstrumentalLayer[]>(layers);
  const { toast } = useToast();

  useEffect(() => {
    setLocalLayers(layers);
  }, [layers]);

  const handleVolumeChange = async (layerId: string, value: number) => {
    try {
      const updatedLayers = localLayers.map((layer) =>
        layer.id === layerId ? { ...layer, volume: value } : layer,
      );
      setLocalLayers(updatedLayers);

      await updateTrackParameters(trackId, {
        layers: updatedLayers.map(({ id, volume, pan, muted }) => ({
          id,
          volume,
          pan,
          muted,
        })),
      });

      onLayerUpdate(updatedLayers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update layer volume",
        variant: "destructive",
      });
    }
  };

  const handlePanChange = async (layerId: string, value: number) => {
    try {
      const updatedLayers = localLayers.map((layer) =>
        layer.id === layerId ? { ...layer, pan: value } : layer,
      );
      setLocalLayers(updatedLayers);

      await updateTrackParameters(trackId, {
        layers: updatedLayers.map(({ id, volume, pan, muted }) => ({
          id,
          volume,
          pan,
          muted,
        })),
      });

      onLayerUpdate(updatedLayers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update layer pan",
        variant: "destructive",
      });
    }
  };

  const handleMuteToggle = async (layerId: string) => {
    try {
      const updatedLayers = localLayers.map((layer) =>
        layer.id === layerId ? { ...layer, muted: !layer.muted } : layer,
      );
      setLocalLayers(updatedLayers);

      await updateTrackParameters(trackId, {
        layers: updatedLayers.map(({ id, volume, pan, muted }) => ({
          id,
          volume,
          pan,
          muted,
        })),
      });

      onLayerUpdate(updatedLayers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update layer mute state",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instrumental Layers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {localLayers.map((layer) => (
            <div key={layer.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">{layer.name}</Label>
                <div className="flex items-center space-x-2">
                  {layer.muted ? (
                    <SpeakerXIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <VolumeIcon className="h-4 w-4" />
                  )}
                  <Switch
                    checked={!layer.muted}
                    onCheckedChange={(checked) => {
                      const updatedLayer = { ...layer, muted: !checked };
                      const updatedLayers = localLayers.map((l) => 
                        l.id === layer.id ? updatedLayer : l
                      );
                      setLocalLayers(updatedLayers);
                      updateTrackParameters(trackId, {
                        layers: updatedLayers.map(({ id, volume, pan, muted }) => ({
                          id,
                          volume,
                          pan,
                          muted
                        }))
                      }).catch((error) => {
                        console.error("Error updating mute status:", error);
                        toast({
                          title: "Error updating layer",
                          description: "Failed to update layer state. Please try again.",
                          variant: "destructive",
                        });
                        setLocalLayers(localLayers);
                      });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Volume</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(layer.volume * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[layer.volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) =>
                      handleVolumeChange(layer.id, value)
                    }
                    disabled={layer.muted}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Pan</Label>
                    <span className="text-sm text-muted-foreground">
                      {layer.pan < 0 ? "L" : "R"}{" "}
                      {Math.abs(Math.round(layer.pan * 100))}%
                    </span>
                  </div>
                  <Slider
                    value={[layer.pan]}
                    min={-1}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) =>
                      handlePanChange(layer.id, value)
                    }
                    disabled={layer.muted}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
