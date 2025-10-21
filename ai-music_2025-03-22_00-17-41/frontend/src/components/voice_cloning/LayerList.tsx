"use client";

import { Layer } from "./LayerManager.ts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  MoveUp,
  MoveDown,
} from "lucide-react";

interface LayerListProps {
  layers: Layer[];
  activeLayerId: string;
  onLayerSelect: (id: string) => void;
  onLayerVisibilityToggle: (id: string) => void;
  onLayerLockToggle: (id: string) => void;
  onLayerOpacityChange: (id: string, opacity: number) => void;
  onLayerMove: (id: string, direction: "up" | "down") => void;
  onLayerDelete: (id: string) => void;
}

export function LayerList({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerVisibilityToggle,
  onLayerLockToggle,
  onLayerOpacityChange,
  onLayerMove,
  onLayerDelete,
}: LayerListProps) {
  return (
    <div className="space-y-2">
      {layers.map((layer) => (
        <div
          key={layer.id}
          className={`p-2 border rounded-md ${
            layer.id === activeLayerId ? "border-primary" : ""
          }`}
          onClick={() => onLayerSelect(layer.id)}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLayerVisibilityToggle(layer.id)}
            >
              {layer.visible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLayerLockToggle(layer.id)}
            >
              {layer.locked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </Button>
            <Input value={layer.name} className="h-8" readOnly />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLayerMove(layer.id, "up")}
            >
              <MoveUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLayerMove(layer.id, "down")}
            >
              <MoveDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLayerDelete(layer.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2">
            <Slider
              value={[layer.opacity * 100]}
              onValueChange={([value]) =>
                onLayerOpacityChange(layer.id, value / 100)
              }
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
