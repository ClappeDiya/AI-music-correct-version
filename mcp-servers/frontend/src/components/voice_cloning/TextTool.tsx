"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Type } from "lucide-react";

interface TextToolProps {
  onAddText: (
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string,
  ) => void;
}

export function TextTool({ onAddText }: TextToolProps) {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [isPlacing, setIsPlacing] = useState(false);

  const handleStartPlacing = () => {
    if (!text.trim()) return;
    setIsPlacing(true);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlacing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onAddText(text, x, y, fontSize, "currentColor");
    setText("");
    setIsPlacing(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text..."
        className="w-40"
      />
      <Input
        type="number"
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        min={8}
        max={72}
        className="w-20"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleStartPlacing}
        disabled={!text.trim()}
      >
        <Type className="h-4 w-4" />
      </Button>
    </div>
  );
}
