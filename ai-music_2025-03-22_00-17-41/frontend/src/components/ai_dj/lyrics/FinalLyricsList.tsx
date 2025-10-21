import { useState } from "react";
import { Copy, Download, Eye, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/useToast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useLyrics } from "@/hooks/uselyrics";
import type { FinalLyrics } from "@/types/LyricsGeneration";

export function FinalLyricsList() {
  const { finalLyrics, loading, refresh } = useLyrics();
  const { toast } = useToast();
  const [selectedLyrics, setSelectedLyrics] = useState<FinalLyrics | null>(
    null,
  );

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Success",
        description: "Lyrics copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy lyrics",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (lyrics: FinalLyrics) => {
    const blob = new Blob([lyrics.lyrics_content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lyrics-${lyrics.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p>Loading lyrics...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[600px] pr-4">
        {finalLyrics.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No final lyrics found
            </p>
          </Card>
        ) : (
          finalLyrics.map((lyrics) => (
            <Card key={lyrics.id} className="p-4 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">Track #{lyrics.track_id}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(lyrics.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(lyrics.lyrics_content)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(lyrics)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLyrics(lyrics)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Implement share functionality
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      try {
                        // TODO: Implement delete
                        toast({
                          title: "Success",
                          description: "Lyrics deleted successfully",
                        });
                        refresh();
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to delete lyrics",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md max-h-32 overflow-hidden">
                {lyrics.lyrics_content}
              </pre>
            </Card>
          ))
        )}
      </ScrollArea>

      <Dialog
        open={!!selectedLyrics}
        onOpenChange={() => setSelectedLyrics(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Track #{selectedLyrics?.track_id} Lyrics</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px]">
            <pre className="whitespace-pre-wrap text-sm p-4">
              {selectedLyrics?.lyrics_content}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
