"use client";

import { useState } from "react";
import { TrackReference } from "@/services/trackReferenceService";
import { TrackEmbed } from "./TrackEmbed";
import { Button } from "@/components/ui/Button";
import { Grid2X2, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackGridProps {
  references: TrackReference[];
  onVersionChange?: (referenceId: string, version: number) => void;
  className?: string;
}

export function TrackGrid({
  references,
  onVersionChange,
  className = "",
}: TrackGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className={cn("space-y-4", className)}>
      {/* View Mode Toggle */}
      <div className="flex justify-end space-x-2">
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("grid")}
        >
          <Grid2X2 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("list")}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Track Grid/List */}
      <div
        className={cn(
          "grid gap-4",
          viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1",
        )}
      >
        {references.map((reference) => (
          <TrackEmbed
            key={reference.id}
            referenceId={reference.id}
            showVersions={viewMode === "list"}
            onVersionChange={
              onVersionChange
                ? (version) => onVersionChange(reference.id, version)
                : undefined
            }
          />
        ))}
      </div>

      {/* Empty State */}
      {references.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No tracks found
        </div>
      )}
    </div>
  );
}
