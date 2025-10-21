"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { MusicalNotationVisualizer } from "./MusicalNotationVisualizer";

interface MusicVisualizationProps {
  audioUrl: string;
  waveformData?: number[];
  notationData: string;
  className?: string;
  onDownloadNotation?: () => void;
}

export function MusicVisualization({
  audioUrl,
  waveformData,
  notationData,
  className = "",
  onDownloadNotation,
}: MusicVisualizationProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WaveformVisualizer audioUrl={audioUrl} waveformData={waveformData} />
          <MusicalNotationVisualizer
            notationData={notationData}
            onDownload={onDownloadNotation}
          />
        </div>
      </CardContent>
    </Card>
  );
}
