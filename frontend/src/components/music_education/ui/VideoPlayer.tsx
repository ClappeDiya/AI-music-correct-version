"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/Badge';
import { Slider } from '@/components/ui/Slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  MessageSquarePlus,
  Clock,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { toast } from "sonner";
import { musicEducationApi } from '@/services/music_education_api";

interface VideoNote {
  id: string;
  timestamp: number;
  text: string;
  createdAt: string;
}

interface DownloadableMaterial {
  id: string;
  title: string;
  description: string;
  url: string;
  fileType: string;
}

interface VideoQuality {
  quality: string;
  url: string;
}

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  notes?: VideoNote[];
  materials?: DownloadableMaterial[];
  onAddNote?: (note: Omit<VideoNote, "id" | "createdAt">) => void;
  onAnalytics?: (event: {
    event: 'play' | 'pause' | 'seek' | 'complete';
    timestamp: number;
    duration?: number;
  }) => void;
  className?: string;
}

export function VideoPlayer({
  videoUrl,
  title,
  notes = [],
  materials = [],
  onAddNote,
  onAnalytics,
  className,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteText, setNoteText] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qualities, setQualities] = useState<VideoQuality[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    loadQualities();
  }, [videoUrl]);

  const loadQualities = async () => {
    try {
      const availableQualities = await musicEducationApi.getAvailableQualities(videoUrl);
      setQualities(availableQualities);
      if (availableQualities.length > 0) {
        setSelectedQuality(availableQualities[0].quality);
      }
    } catch (error) {
      console.error("Failed to load video qualities:", error);
    }
  };

  const handleQualityChange = (quality: string) => {
    const selectedQualityData = qualities.find(q => q.quality === quality);
    if (selectedQualityData) {
      setSelectedQuality(quality);
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        videoRef.current.src = selectedQualityData.url;
        videoRef.current.currentTime = currentTime;
        if (isPlaying) {
          videoRef.current.play();
        }
      }
    }
  };

  const handleDownloadOffline = async () => {
    try {
      setIsDownloading(true);
      const { downloadId } = await musicEducationApi.requestOfflineDownload(
        videoUrl,
        selectedQuality
      );

      const checkStatus = async () => {
        const status = await musicEducationApi.getOfflineDownloadStatus(downloadId);
        if (status.status === 'completed' && status.url) {
          setIsDownloading(false);
          setDownloadProgress(0);
          // Trigger download using the URL
          const a = document.createElement('a');
          a.href = status.url;
          a.download = `${title}.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toast.success("Video downloaded successfully");
        } else if (status.status === 'failed') {
          setIsDownloading(false);
          setDownloadProgress(0);
          toast.error("Failed to download video");
        } else if (status.progress !== undefined) {
          setDownloadProgress(status.progress);
          setTimeout(checkStatus, 1000);
        }
      };

      checkStatus();
    } catch (error) {
      setIsDownloading(false);
      setDownloadProgress(0);
      toast.error("Failed to start download");
    }
  };

  // Update analytics
  useEffect(() => {
    if (!onAnalytics) return;

    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      onAnalytics({
        event: 'play',
        timestamp: video.currentTime,
        duration: video.duration,
      });
    };

    const handlePause = () => {
      onAnalytics({
        event: 'pause',
        timestamp: video.currentTime,
        duration: video.duration,
      });
    };

    const handleSeek = () => {
      onAnalytics({
        event: 'seek',
        timestamp: video.currentTime,
        duration: video.duration,
      });
    };

    const handleEnded = () => {
      onAnalytics({
        event: 'complete',
        timestamp: video.duration,
        duration: video.duration,
      });
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeked', handleSeek);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeked', handleSeek);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onAnalytics]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSkip = (direction: "forward" | "backward") => {
    if (!videoRef.current) return;
    const skipAmount = 10;
    const newTime = direction === "forward" 
      ? Math.min(currentTime + skipAmount, duration)
      : Math.max(currentTime - skipAmount, 0);
    handleSeek(newTime);
  };

  const handleAddNote = () => {
    if (!onAddNote || !noteText.trim()) return;
    onAddNote({
      timestamp: currentTime,
      text: noteText.trim(),
    });
    setNoteText("");
    setShowNoteDialog(false);
  };

  const jumpToTimestamp = (timestamp: number) => {
    handleSeek(timestamp);
    if (!isPlaying) handlePlayPause();
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center gap-4">
            {qualities.length > 0 && (
              <Select value={selectedQuality} onValueChange={handleQualityChange}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Quality" />
                </SelectTrigger>
                <SelectContent>
                  {qualities.map((q) => (
                    <SelectItem key={q.quality} value={q.quality}>
                      {q.quality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadOffline}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  {Math.round(downloadProgress)}%
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>
            {materials.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Materials
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Downloadable Materials</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {materials.map((material) => (
                      <Card key={material.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <h4 className="font-medium">{material.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {material.description}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(material.url, "_blank")}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            onClick={handlePlayPause}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="space-y-4">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={([value]) => handleSeek(value)}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSkip("backward")}
                    className="text-white hover:text-white/80"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayPause}
                    className="text-white hover:text-white/80"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSkip("forward")}
                    className="text-white hover:text-white/80"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                {onAddNote && (
                  <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:text-white/80"
                      >
                        <MessageSquarePlus className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Note at {formatTime(currentTime)}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Enter your note..."
                        />
                        <Button onClick={handleAddNote}>Save Note</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>
        </div>

        {notes.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Notes</h4>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {notes.map((note) => (
                  <Card key={note.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => jumpToTimestamp(note.timestamp)}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(note.timestamp)}
                      </Badge>
                      <p className="text-sm flex-1">{note.text}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 

