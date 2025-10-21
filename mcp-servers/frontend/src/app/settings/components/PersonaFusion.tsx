"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/usetoast";
import { Loader2, Users, Sparkles, Shuffle, Plus } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import { Badge } from "@/components/ui/Badge";
import { settingsService, PersonaFusion } from "@/services/settings.service";

export function PersonaFusion() {
  const [personas, setPersonas] = useState<PersonaFusion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      const data = await settingsService.getPersonaFusions();
      setPersonas(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load persona fusions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePersona = async () => {
    try {
      const newPersona = await settingsService.createPersonaFusion({
        name: "New Persona",
        active: true,
        fusion_weights: {},
        confidence_threshold: 0.7,
      });
      setPersonas((prev) => [...prev, newPersona]);
      toast({
        title: "Success",
        description: "New persona fusion created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create persona fusion",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: number, updates: Partial<PersonaFusion>) => {
    try {
      const updated = await settingsService.updatePersonaFusion(id, updates);
      setPersonas((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast({
        title: "Success",
        description: "Persona fusion updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update persona fusion",
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
        <h2 className="text-lg font-semibold">Persona Fusions</h2>
        <Button onClick={handleCreatePersona}>
          <Plus className="h-4 w-4 mr-2" />
          Create Persona
        </Button>
      </div>

      <div className="grid gap-6">
        {personas.map((persona) => (
          <Card key={persona.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <Input
                    value={persona.name}
                    onChange={(e) =>
                      handleUpdate(persona.id, { name: e.target.value })
                    }
                    className="h-7 px-2"
                  />
                </div>
                <Switch
                  checked={persona.active}
                  onCheckedChange={(checked) =>
                    handleUpdate(persona.id, { active: checked })
                  }
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Confidence Threshold</Label>
                  <Badge variant="secondary">
                    {Math.round(persona.confidence_threshold * 100)}%
                  </Badge>
                </div>
                <Slider
                  value={[persona.confidence_threshold * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) =>
                    handleUpdate(persona.id, {
                      confidence_threshold: value / 100,
                    })
                  }
                />
              </div>

              <div className="space-y-4">
                <Label>Fusion Weights</Label>
                {Object.entries(persona.fusion_weights).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-3 gap-4 items-center"
                  >
                    <span className="text-sm font-medium">{key}</span>
                    <Slider
                      value={[value * 100]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([newValue]) =>
                        handleUpdate(persona.id, {
                          fusion_weights: {
                            ...persona.fusion_weights,
                            [key]: newValue / 100,
                          },
                        })
                      }
                    />
                    <Badge variant="outline" className="justify-self-end">
                      {Math.round(value * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Handle fusion recalculation
                  }}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Recalculate
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // Handle fusion optimization
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Optimize
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {personas.length === 0 && (
        <Card className="p-8 flex flex-col items-center justify-center text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Personas Created</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first persona fusion to start combining preferences
          </p>
          <Button onClick={handleCreatePersona}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Persona
          </Button>
        </Card>
      )}
    </div>
  );
}
