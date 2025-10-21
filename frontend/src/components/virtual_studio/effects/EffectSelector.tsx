import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Slider } from "@/components/ui/Slider";
import type { Effect } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

interface EffectSelectorProps {
  onSelect: (effect: Effect, parameters: Record<string, number>) => void;
}

export function EffectSelector({ onSelect }: EffectSelectorProps) {
  const [open, setOpen] = useState(false);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [selectedEffect, setSelectedEffect] = useState<Effect | null>(null);
  const [parameters, setParameters] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadEffects = async () => {
      try {
        const data = await virtualStudioApi.getEffects();
        setEffects(data);
      } catch (error) {
        console.error("Error loading effects:", error);
      }
    };

    loadEffects();
  }, []);

  useEffect(() => {
    if (selectedEffect?.base_parameters) {
      const initialParams: Record<string, number> = {};
      Object.entries(selectedEffect.base_parameters).forEach(([key, value]) => {
        initialParams[key] = typeof value === "number" ? value : 0;
      });
      setParameters(initialParams);
    }
  }, [selectedEffect]);

  const handleEffectSelect = (effect: Effect) => {
    setSelectedEffect(effect);
    setOpen(false);
  };

  const handleParameterChange = (param: string, value: number) => {
    setParameters((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleApply = () => {
    if (selectedEffect) {
      onSelect(selectedEffect, parameters);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Effect</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedEffect ? selectedEffect.name : "Select effect..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search effects..." />
              <CommandEmpty>No effects found.</CommandEmpty>
              <CommandGroup>
                {effects.map((effect) => (
                  <CommandItem
                    key={effect.id}
                    onSelect={() => handleEffectSelect(effect)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedEffect?.id === effect.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {effect.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedEffect && selectedEffect.base_parameters && (
          <div className="space-y-4">
            <h3 className="font-medium">Parameters</h3>
            {Object.entries(selectedEffect.base_parameters).map(
              ([param, value]) => (
                <div key={param} className="space-y-2">
                  <Label>{param}</Label>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[parameters[param] || 0]}
                    onValueChange={([value]) =>
                      handleParameterChange(param, value)
                    }
                  />
                </div>
              ),
            )}
            <Button className="w-full" onClick={handleApply}>
              Apply Effect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
