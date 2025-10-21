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
import type { Instrument } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

interface InstrumentSelectorProps {
  onSelect: (
    instrument: Instrument,
    parameters: Record<string, number>,
  ) => void;
}

export function InstrumentSelector({ onSelect }: InstrumentSelectorProps) {
  const [open, setOpen] = useState(false);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);
  const [parameters, setParameters] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadInstruments = async () => {
      try {
        const data = await virtualStudioApi.getInstruments();
        setInstruments(data);
      } catch (error) {
        console.error("Error loading instruments:", error);
      }
    };

    loadInstruments();
  }, []);

  useEffect(() => {
    if (selectedInstrument?.base_parameters) {
      const initialParams: Record<string, number> = {};
      Object.entries(selectedInstrument.base_parameters).forEach(
        ([key, value]) => {
          initialParams[key] = typeof value === "number" ? value : 0;
        },
      );
      setParameters(initialParams);
    }
  }, [selectedInstrument]);

  const handleInstrumentSelect = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    setOpen(false);
  };

  const handleParameterChange = (param: string, value: number) => {
    setParameters((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleApply = () => {
    if (selectedInstrument) {
      onSelect(selectedInstrument, parameters);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Instrument</CardTitle>
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
              {selectedInstrument
                ? selectedInstrument.name
                : "Select instrument..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search instruments..." />
              <CommandEmpty>No instruments found.</CommandEmpty>
              <CommandGroup>
                {instruments.map((instrument) => (
                  <CommandItem
                    key={instrument.id}
                    onSelect={() => handleInstrumentSelect(instrument)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedInstrument?.id === instrument.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {instrument.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedInstrument && selectedInstrument.base_parameters && (
          <div className="space-y-4">
            <h3 className="font-medium">Parameters</h3>
            {Object.entries(selectedInstrument.base_parameters).map(
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
              Apply Instrument
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
