"use client";

import React, { useState } from "react";
import { VoiceCommandRecognizer } from "./VoiceCommandRecognizer";
import { VoiceCommandFeedback } from "./VoiceCommandFeedback";
import { cn } from "@/lib/utils";

interface VoiceCommandSystemProps {
  sessionId: number;
  className?: string;
}

interface Command {
  id: string;
  text: string;
  status: "success" | "error" | "processing";
  timestamp: string;
}

export function VoiceCommandSystem({
  sessionId,
  className,
}: VoiceCommandSystemProps) {
  const [commands, setCommands] = useState<Command[]>([]);

  const handleCommandRecognized = (commandText: string) => {
    const newCommand: Command = {
      id: crypto.randomUUID(),
      text: commandText,
      status: "processing",
      timestamp: new Date().toISOString(),
    };

    setCommands((prev) => [newCommand, ...prev]);

    // Simulate command processing
    setTimeout(() => {
      setCommands((prev) =>
        prev.map((cmd) =>
          cmd.id === newCommand.id
            ? { ...cmd, status: Math.random() > 0.1 ? "success" : "error" }
            : cmd,
        ),
      );
    }, 1000);
  };

  return (
    <div
      className={cn(
        "w-full max-w-5xl mx-auto p-4",
        "grid grid-cols-1 lg:grid-cols-2 gap-4",
        className,
      )}
    >
      <div className="w-full flex justify-center">
        <VoiceCommandRecognizer
          sessionId={sessionId}
          onCommandRecognized={handleCommandRecognized}
          className="w-full"
        />
      </div>
      <div className="w-full flex justify-center">
        <VoiceCommandFeedback commands={commands} className="w-full" />
      </div>
    </div>
  );
}
