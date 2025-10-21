import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    { className, value, onValueChange, min = 0, max = 100, step = 1, disabled = false, ...props },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange([Number(e.target.value)]);
    };

    return (
      <div ref={ref} className={cn("relative w-full", className)} {...props}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleChange}
          disabled={disabled}
          className={cn("w-full", disabled && "opacity-50 cursor-not-allowed")}
        />
      </div>
    );
  },
);
Slider.displayName = "Slider";

export { Slider };
