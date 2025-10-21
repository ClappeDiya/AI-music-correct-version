"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/usetoast";
import { Loader2, Plus, ArrowUpDown, Layers } from "lucide-react";
import {
  settingsService,
  PreferenceInheritanceLayer,
} from "@/services/settings.service";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

export function InheritanceSettings() {
  const [layers, setLayers] = useState<PreferenceInheritanceLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLayers();
  }, []);

  const loadLayers = async () => {
    try {
      const data = await settingsService.getInheritanceLayers();
      setLayers(data.sort((a, b) => a.priority - b.priority));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load inheritance layers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLayer = async () => {
    try {
      const newLayer = await settingsService.createInheritanceLayer({
        priority: layers.length,
        inheritance_rules: {},
      });
      setLayers((prev) => [...prev, newLayer]);
      toast({
        title: "Success",
        description: "New inheritance layer created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create layer",
        variant: "destructive",
      });
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(layers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update priorities
    const updatedItems = items.map((item, index) => ({
      ...item,
      priority: index,
    }));

    setLayers(updatedItems);

    try {
      // Update priorities in backend
      await Promise.all(
        updatedItems.map((layer) =>
          settingsService.updateInheritanceLayer(layer.id, {
            priority: layer.priority,
          }),
        ),
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update layer priorities",
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
        <h2 className="text-lg font-semibold">Preference Inheritance Layers</h2>
        <Button onClick={handleCreateLayer}>
          <Plus className="h-4 w-4 mr-2" />
          Add Layer
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="layers">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {layers.map((layer, index) => (
                <Draggable
                  key={layer.id}
                  draggableId={String(layer.id)}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="mb-4"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div {...provided.dragHandleProps}>
                                <ArrowUpDown className="h-4 w-4" />
                              </div>
                              <span>Layer {index + 1}</span>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Layers className="h-4 w-4" />
                              <Label>Priority Level: {layer.priority}</Label>
                            </div>
                            {/* Add more layer-specific controls here */}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
