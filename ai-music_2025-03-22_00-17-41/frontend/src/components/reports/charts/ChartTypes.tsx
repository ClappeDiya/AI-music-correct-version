"use client";

import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  Activity,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

export type ChartType = "line" | "bar" | "pie" | "area" | "scatter";

interface ChartTypeSelectorProps {
  value: ChartType;
  onValueChange: (value: ChartType) => void;
}

export const chartTypes = [
  {
    value: "line",
    icon: LineChartIcon,
    label: "Line Chart",
    description: "Show trends over time",
  },
  {
    value: "bar",
    icon: BarChartIcon,
    label: "Bar Chart",
    description: "Compare values across categories",
  },
  {
    value: "area",
    icon: AreaChartIcon,
    label: "Area Chart",
    description: "Show cumulative totals over time",
  },
  {
    value: "pie",
    icon: PieChartIcon,
    label: "Pie Chart",
    description: "Show proportions of a whole",
  },
  {
    value: "scatter",
    icon: Activity,
    label: "Scatter Plot",
    description: "Show relationships between variables",
  },
] as const;

export function ChartTypeSelector({
  value,
  onValueChange,
}: ChartTypeSelectorProps) {
  return (
    <TooltipProvider>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(value) => value && onValueChange(value as ChartType)}
        className="justify-start"
      >
        {chartTypes.map((type) => (
          <Tooltip key={type.value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={type.value}
                aria-label={type.label}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <type.icon className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{type.label}</p>
              <p className="text-sm text-muted-foreground">
                {type.description}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  );
}
