"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PlayIcon, PauseIcon, SkipBackIcon, DownloadIcon } from "lucide-react";
import abcjs from "abcjs";

interface MusicalNotationVisualizerProps {
  notationData: string;
  title?: string;
  className?: string;
  onDownload?: () => void;
}

export function MusicalNotationVisualizer({
  notationData,
  title = "Musical Notation",
  className = "",
  onDownload,
}: MusicalNotationVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<any>(null);
  const visualRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !notationData) return;

    try {
      // Render notation
      const visualObj = abcjs.renderAbc(containerRef.current, notationData, {
        responsive: "resize",
        add_classes: true,
        paddingleft: 0,
        paddingright: 0,
        paddingbottom: 0,
        paddingtop: 0,
        format: {
          gchordfont: "serif",
          wordsfont: "serif",
          vocalfont: "serif",
          composerfont: "serif",
        },
      })[0];

      // Initialize audio synthesis
      const synth = new abcjs.synth.CreateSynth();
      synth
        .init({
          visualObj,
          options: {
            program: 0, // Piano
            midiTranspose: 0,
            soundFontUrl: "path/to/soundfont/",
          },
        })
        .then(() => {
          synthRef.current = synth;
          visualRef.current = visualObj;
        });

      return () => {
        if (synthRef.current) {
          synthRef.current.stop();
        }
      };
    } catch (error) {
      console.error("Error rendering notation:", error);
    }
  }, [notationData]);

  const handlePlay = () => {
    if (!synthRef.current || !visualRef.current) return;

    if (synthRef.current.isRunning) {
      synthRef.current.pause();
    } else {
      synthRef.current.play();
    }
  };

  const handleRestart = () => {
    if (!synthRef.current || !visualRef.current) return;
    synthRef.current.stop();
    synthRef.current.play();
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {onDownload && (
          <Button variant="outline" size="icon" onClick={onDownload}>
            <DownloadIcon className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!notationData ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div ref={containerRef} className="w-full overflow-x-auto" />
          )}

          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRestart}
              disabled={!synthRef.current}
            >
              <SkipBackIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlay}
              disabled={!synthRef.current}
            >
              {synthRef.current?.isRunning ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
