"use client";

import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

const COLOR_PRESETS = [
  { value: "#000000", label: "Black" },
  { value: "#FF0000", label: "Red" },
  { value: "#00FF00", label: "Green" },
  { value: "#0000FF", label: "Blue" },
  { value: "#FFFF00", label: "Yellow" },
  { value: "#FF00FF", label: "Magenta" },
  { value: "#00FFFF", label: "Cyan" },
  { value: "#FFFFFF", label: "White" },
];

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-9 h-9 p-0", className)}
          aria-label="Choose color"
        >
          <div
            className="w-6 h-6 rounded-sm border"
            style={{ backgroundColor: color }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant="outline"
              className="w-8 h-8 p-0"
              onClick={() => onChange(preset.value)}
              aria-label={`Select ${preset.label}`}
            >
              <div
                className="w-6 h-6 rounded-sm border"
                style={{ backgroundColor: preset.value }}
              />
            </Button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <label htmlFor="custom-color" className="text-sm font-medium">
            Custom
          </label>
          <input
            id="custom-color"
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded-md"
            aria-label="Choose custom color"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
