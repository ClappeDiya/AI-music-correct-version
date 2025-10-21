"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Power, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import { EffectSelector } from "./effect-selector";
import type { Effect, TrackEffect } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

interface EffectChainProps {
  trackId: string;
  effects: TrackEffect[];
  onEffectsChange: (effects: TrackEffect[]) => void;
}

export function EffectChain({
  trackId,
  effects,
  onEffectsChange,
}: EffectChainProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(effects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update effect positions
    const updatedEffects = items.map((effect, index) => ({
      ...effect,
      position: index,
    }));

    onEffectsChange(updatedEffects);
  };

  const handleEffectToggle = async (effectId: string, enabled: boolean) => {
    const updatedEffects = effects.map((effect) =>
      effect.id === effectId ? { ...effect, enabled } : effect,
    );
    onEffectsChange(updatedEffects);
  };

  const handleEffectAdd = async (
    effect: Effect,
    parameters: Record<string, number>,
  ) => {
    try {
      const newTrackEffect = await virtualStudioApi.createTrackEffect({
        track: trackId,
        effect: effect.id,
        position: effects.length,
        enabled: true,
        parameters,
      });
      onEffectsChange([...effects, newTrackEffect]);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding effect:", error);
    }
  };

  const handleEffectSettings = async (
    effectId: string,
    parameters: Record<string, number>,
  ) => {
    const updatedEffects = effects.map((effect) =>
      effect.id === effectId ? { ...effect, parameters } : effect,
    );
    onEffectsChange(updatedEffects);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Effect Chain</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Add Effect
            </Button>
          </DialogTrigger>
          <DialogContent>
            <EffectSelector onSelect={handleEffectAdd} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="effects">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {effects.map((effect, index) => (
                  <Draggable
                    key={effect.id}
                    draggableId={effect.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md border",
                          snapshot.isDragging && "border-primary",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span>{effect.effect_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Settings2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <EffectSelector
                                initialEffect={effect.effect}
                                initialParameters={effect.parameters}
                                onSelect={(_, parameters) =>
                                  handleEffectSettings(effect.id, parameters)
                                }
                              />
                            </DialogContent>
                          </Dialog>
                          <Switch
                            checked={effect.enabled}
                            onCheckedChange={(enabled) =>
                              handleEffectToggle(effect.id, enabled)
                            }
                            size="sm"
                          />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}
