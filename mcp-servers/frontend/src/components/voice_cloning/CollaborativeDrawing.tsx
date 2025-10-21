"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { CollaborationService } from "@/services/websocket/collaboration";
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  Undo,
  Redo,
  Download,
  Type,
  Minus,
} from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { ColorPicker } from "./ColorPicker";
import { TextTool } from "./TextTool";
import { DrawingHistory } from "./DrawingHistory.ts";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { LayerManager, Layer } from "./LayerManager.ts";
import { LayerList } from "./LayerList";
import { useTouchGestures } from "@/hooks/UseTouchGestures";

interface DrawingEvent {
  type: "start" | "move" | "end";
  x: number;
  y: number;
  color: string;
  tool: string;
  width: number;
}

interface CollaborativeDrawingProps {
  modelId: number;
  userId: string;
}

const TOOLS = [
  { id: "pencil", icon: Pencil, label: "Pencil" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "text", icon: Type, label: "Text" },
] as const;

export function CollaborativeDrawing({
  modelId,
  userId,
}: CollaborativeDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<
    "pencil" | "eraser" | "rectangle" | "circle" | "line" | "text"
  >("pencil");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [collaboration, setCollaboration] =
    useState<CollaborationService | null>(null);
  const [history, setHistory] = useState<DrawingHistory | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [layerManager, setLayerManager] = useState<LayerManager | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const service = new CollaborationService(modelId, userId);

    service.subscribe("drawing_event", (event) => {
      const drawingEvent = event.data as DrawingEvent;
      handleDrawingEvent(drawingEvent);
    });

    service.connect();
    setCollaboration(service);

    if (canvasRef.current) {
      const manager = new LayerManager(800, 600);
      setLayerManager(manager);
      setHistory(new DrawingHistory(canvasRef.current));
    }

    return () => service.disconnect();
  }, [modelId, userId]);

  useTouchGestures(containerRef, {
    onPinchZoom: (newScale, centerX, centerY) => {
      setScale(Math.min(Math.max(0.5, newScale), 3));
    },
    onPanMove: (deltaX, deltaY) => {
      setOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    },
  });

  const handleDrawingEvent = (event: DrawingEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = event.color;
    ctx.lineWidth = event.width;

    switch (event.type) {
      case "start":
        ctx.beginPath();
        ctx.moveTo(event.x, event.y);
        break;
      case "move":
        ctx.lineTo(event.x, event.y);
        ctx.stroke();
        break;
      case "end":
        ctx.closePath();
        break;
    }
  };

  const handleStart = (x: number, y: number) => {
    setIsDrawing(true);
    if (!collaboration) return;

    collaboration.sendEvent("drawing_event", {
      type: "start",
      x,
      y,
      color,
      tool,
      width: lineWidth,
    });
  };

  const handleMove = (x: number, y: number) => {
    if (!isDrawing || !collaboration) return;

    collaboration.sendEvent("drawing_event", {
      type: "move",
      x,
      y,
      color,
      tool,
      width: lineWidth,
    });
  };

  const handleEnd = () => {
    if (!isDrawing || !collaboration) return;
    setIsDrawing(false);
    lastPoint.current = null;
    history?.saveState();

    collaboration.sendEvent("drawing_event", {
      type: "end",
      x: 0,
      y: 0,
      color,
      tool,
      width: lineWidth,
    });
  };

  const handleUndo = () => {
    if (history?.undo()) {
      collaboration?.sendEvent("undo", {});
    }
  };

  const handleRedo = () => {
    if (history?.redo()) {
      collaboration?.sendEvent("redo", {});
    }
  };

  // Keyboard shortcuts
  useHotkeys("p", () => setTool("pencil"), []);
  useHotkeys("e", () => setTool("eraser"), []);
  useHotkeys("r", () => setTool("rectangle"), []);
  useHotkeys("c", () => setTool("circle"), []);
  useHotkeys("esc", () => setIsDrawing(false), []);

  // Handle keyboard navigation in canvas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDrawing) return;

    const MOVE_AMOUNT = 5;
    const canvas = canvasRef.current;
    if (!canvas) return;

    switch (e.key) {
      case "ArrowUp":
        handleMove(0, -MOVE_AMOUNT);
        break;
      case "ArrowDown":
        handleMove(0, MOVE_AMOUNT);
        break;
      case "ArrowLeft":
        handleMove(-MOVE_AMOUNT, 0);
        break;
      case "ArrowRight":
        handleMove(MOVE_AMOUNT, 0);
        break;
      case "Enter":
      case "Space":
        handleEnd();
        break;
    }
  };

  // Add touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    lastPoint.current = { x, y };
    handleStart(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleMove(x, y);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pencil className="h-5 w-5" />
          Collaborative Drawing
          <VisuallyHidden>
            Use keyboard shortcuts: P for pencil, E for eraser, R for rectangle,
            C for circle
          </VisuallyHidden>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr,200px] gap-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {TOOLS.map(({ id, icon: Icon, label }) => (
                <Button
                  key={id}
                  variant={tool === id ? "default" : "outline"}
                  onClick={() => setTool(id as typeof tool)}
                  aria-label={label}
                  title={`${label} (${id[0].toUpperCase()})`}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}

              <ColorPicker color={color} onChange={setColor} />

              <Select
                value={lineWidth.toString()}
                onValueChange={(value) => setLineWidth(parseInt(value))}
                aria-label="Line width"
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Thin</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="4">Thick</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={handleUndo}
                disabled={!history}
                aria-label="Undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleRedo}
                disabled={!history}
                aria-label="Redo"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            {tool === "text" && (
              <TextTool
                onAddText={(text, x, y, fontSize, color) => {
                  const ctx = canvasRef.current?.getContext("2d");
                  if (!ctx) return;

                  ctx.font = `${fontSize}px sans-serif`;
                  ctx.fillStyle = color;
                  ctx.fillText(text, x, y);
                  history?.saveState();
                }}
              />
            )}

            <div
              ref={containerRef}
              className="relative overflow-hidden border rounded-md"
              style={{
                width: "800px",
                height: "600px",
              }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="touch-none absolute"
                style={{
                  transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
                }}
                onMouseDown={(e) => {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  handleStart(e.clientX - rect.left, e.clientY - rect.top);
                }}
                onMouseMove={(e) => {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  handleMove(e.clientX - rect.left, e.clientY - rect.top);
                }}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="application"
                aria-label="Drawing canvas"
              />
            </div>
          </div>
          {layerManager && (
            <LayerList
              layers={layerManager.layers}
              activeLayerId={layerManager.getActiveLayer()?.id || ""}
              onLayerSelect={(id) => layerManager.setActiveLayer(id)}
              onLayerVisibilityToggle={(id) => {
                layerManager.toggleLayerVisibility(id);
                layerManager.composeLayers(canvasRef.current!);
              }}
              onLayerLockToggle={(id) => {
                const layer = layerManager.getLayer(id);
                if (layer) layer.locked = !layer.locked;
              }}
              onLayerOpacityChange={(id, opacity) => {
                layerManager.setLayerOpacity(id, opacity);
                layerManager.composeLayers(canvasRef.current!);
              }}
              onLayerMove={(id, direction) => {
                layerManager.moveLayer(id, direction);
                layerManager.composeLayers(canvasRef.current!);
              }}
              onLayerDelete={(id) => {
                layerManager.deleteLayer(id);
                layerManager.composeLayers(canvasRef.current!);
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
