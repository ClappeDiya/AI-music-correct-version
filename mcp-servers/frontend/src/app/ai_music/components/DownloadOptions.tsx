"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/ui/usetoast";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { downloadComposition } from "@/app/api/ai-music-generation";

interface DownloadOptionsProps {
  versionId: string;
  availableFormats: {
    wav?: string;
    mp3?: string;
    midi?: string;
  };
  className?: string;
}

export function DownloadOptions({
  versionId,
  availableFormats,
  className = "",
}: DownloadOptionsProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = async (format: string) => {
    setDownloading(format);
    try {
      await downloadComposition(versionId, format);
      toast({
        title: "Download Started",
        description: `Your ${format.toUpperCase()} file is being downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {availableFormats.wav && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleDownload("wav")}
              disabled={!!downloading}
            >
              {downloading === "wav" ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DownloadIcon className="mr-2 h-4 w-4" />
              )}
              WAV
            </Button>
          )}

          {availableFormats.mp3 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleDownload("mp3")}
              disabled={!!downloading}
            >
              {downloading === "mp3" ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DownloadIcon className="mr-2 h-4 w-4" />
              )}
              MP3
            </Button>
          )}

          {availableFormats.midi && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleDownload("midi")}
              disabled={!!downloading}
            >
              {downloading === "midi" ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DownloadIcon className="mr-2 h-4 w-4" />
              )}
              MIDI
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
