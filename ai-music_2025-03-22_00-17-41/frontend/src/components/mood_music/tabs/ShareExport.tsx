"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Copy, Download, Share2 } from "lucide-react";
import { useState } from "react";
import { MoodService, GeneratedTrack } from "@/lib/api/services/mood";
import { useToast } from "@/components/ui/useToast";
import { Track } from "@/lib/api/types";
import { useCache } from "@/hooks/UseCache";
import { CardSkeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";

// Custom hook for track operations
const useTrackOperations = () => {
  const getUserTracks = async () => {
    const response = await api.get<Track[]>('/api/user/tracks');
    return response.data;
  };

  const exportTrack = async (trackId: string, format: string) => {
    const response = await api.post<{ download_url: string }>(`/api/tracks/${trackId}/export`, { format });
    return response.data;
  };

  const shareTrack = async (trackId: string, options?: { public?: boolean }) => {
    const response = await api.post<{ share_url: string }>(`/api/tracks/${trackId}/share`, options);
    return response.data;
  };

  return {
    getUserTracks,
    exportTrack,
    shareTrack
  };
};

export function ShareAndExport() {
  const { toast } = useToast();
  const { getUserTracks, exportTrack, shareTrack } = useTrackOperations();
  const [selectedTrack, setSelectedTrack] = useState("");
  const [exportFormat, setExportFormat] = useState("mp3");
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Use cache for tracks
  const {
    data: tracks,
    isLoading: isLoadingTracks,
    update: updateTracks,
  } = useCache<Track[] | null>("user-tracks", getUserTracks, {
    enabled: true,
    duration: 5 * 60 * 1000, // 5 minutes cache
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load your tracks. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/shared/tracks/${selectedTrack}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Share link copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    if (!selectedTrack) return;

    setIsExporting(true);
    try {
      // Optimistic update - update track status
      if (tracks) {
        const updatedTracks = tracks.map((track) =>
          track.id === selectedTrack
            ? { ...track, status: "exporting" }
            : track
        );
        updateTracks(updatedTracks);
      }

      // Call API to export track
      const result = await exportTrack(selectedTrack, exportFormat);
      
      // Download the exported file
      window.location.href = result.download_url;
      
      toast({
        title: "Export Successful",
        description: `Your track has been exported as ${exportFormat.toUpperCase()}.`,
      });
      
      // Update tracks after export
      if (tracks) {
        const finalUpdatedTracks = tracks.map((track) =>
          track.id === selectedTrack ? { ...track, status: "ready" } : track
        );
        updateTracks(finalUpdatedTracks);
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your track. Please try again.",
        variant: "destructive",
      });
      
      // Revert optimistic update on error
      if (tracks) {
        const revertedTracks = tracks.map((track) =>
          track.id === selectedTrack ? { ...track, status: "ready" } : track
        );
        updateTracks(revertedTracks);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!selectedTrack) return;

    setIsSharing(true);
    try {
      // Optimistic update
      if (tracks) {
        const updatedTracks = tracks.map((track) =>
          track.id === selectedTrack
            ? { ...track, is_shared: true }
            : track
        );
        updateTracks(updatedTracks);
      }

      // Call API to share track
      const result = await shareTrack(selectedTrack, { public: true });
      
      // Show success and provide share link
      toast({
        title: "Track Shared",
        description: "Your track is now shared publicly.",
      });
      
      // Copy share link to clipboard
      await navigator.clipboard.writeText(result.share_url);
      
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Sharing Failed",
        description: "Failed to share your track. Please try again.",
        variant: "destructive",
      });
      
      // Revert optimistic update on error
      if (tracks) {
        const revertedTracks = tracks.map((track) =>
          track.id === selectedTrack
            ? { ...track, is_shared: false }
            : track
        );
        updateTracks(revertedTracks);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Share Track</h3>
          <div className="space-y-4">
            {isLoadingTracks ? (
              <CardSkeleton />
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Select Track</Label>
                  <Select
                    value={selectedTrack}
                    onValueChange={setSelectedTrack}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a track to share" />
                    </SelectTrigger>
                    <SelectContent>
                      {tracks?.map((track) => (
                        <SelectItem key={track.id} value={track.id}>
                          {track.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Share Link</Label>
                  <div className="flex space-x-2">
                    <Input
                      readOnly
                      value={
                        selectedTrack
                          ? `${window.location.origin}/shared/tracks/${selectedTrack}`
                          : ""
                      }
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      disabled={!selectedTrack}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleShare}
                  disabled={!selectedTrack || isSharing}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {isSharing ? "Sharing..." : "Share Track"}
                </Button>
              </>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Export Options</h3>
          <div className="space-y-4">
            {isLoadingTracks ? (
              <CardSkeleton />
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose export format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp3">MP3</SelectItem>
                      <SelectItem value="wav">WAV</SelectItem>
                      <SelectItem value="midi">MIDI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quality Settings</Label>
                  <Select defaultValue="high">
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (128kbps)</SelectItem>
                      <SelectItem value="medium">Medium (256kbps)</SelectItem>
                      <SelectItem value="high">High (320kbps)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleExport}
                  disabled={!selectedTrack || isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export Track"}
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Integration Options</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-24"
            onClick={() => {
              toast({
                title: "Coming Soon",
                description: "Spotify integration will be available soon!",
              });
            }}
          >
            <div className="text-center">
              <h4 className="font-medium">Spotify</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Export to playlist
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-24"
            onClick={() => {
              toast({
                title: "Coming Soon",
                description: "Apple Music integration will be available soon!",
              });
            }}
          >
            <div className="text-center">
              <h4 className="font-medium">Apple Music</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Add to library
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-24"
            onClick={() => {
              toast({
                title: "Coming Soon",
                description:
                  "YouTube Music integration will be available soon!",
              });
            }}
          >
            <div className="text-center">
              <h4 className="font-medium">YouTube Music</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Upload to channel
              </p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}
