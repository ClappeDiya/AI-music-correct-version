"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { KPIWidget } from "./kpi-widget";
import { dashboardApi } from "@/lib/api/dashboard";

interface DashboardGridProps {
  className?: string;
}

interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config: Record<string, any>;
}

export function DashboardGrid({ className }: DashboardGridProps) {
  const [grid, setGrid] = useState<GridStack | null>(null);

  // Fetch user's dashboard configuration
  const { data: widgets, isLoading } = useQuery({
    queryKey: ["dashboard-config"],
    queryFn: () => dashboardApi.getConfig(),
  });

  // Save dashboard configuration
  const saveMutation = useMutation({
    mutationFn: (config: WidgetConfig[]) => dashboardApi.saveConfig(config),
  });

  // Initialize GridStack
  useState(() => {
    if (typeof window !== "undefined" && !grid) {
      const gridStack = GridStack.init({
        column: 12,
        cellHeight: 60,
        animate: true,
        float: false,
        resizable: {
          handles: "e,se,s,sw,w",
        },
      });

      gridStack.on("change", (event, items) => {
        const updatedConfig = items.map((item) => ({
          id: item.id,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        }));
        saveMutation.mutate(updatedConfig);
      });

      setGrid(gridStack);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn("grid-stack", className)}>
      {widgets?.map((widget) => (
        <div
          key={widget.id}
          className="grid-stack-item"
          data-gs-x={widget.x}
          data-gs-y={widget.y}
          data-gs-width={widget.w}
          data-gs-height={widget.h}
        >
          <div className="grid-stack-item-content">
            <KPIWidget
              type={widget.type}
              title={widget.title}
              config={widget.config}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
