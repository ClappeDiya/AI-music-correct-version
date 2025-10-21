"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/useToast";
import {
  ListMusic,
  Play,
  Pause,
  SkipForward,
  Clock,
  Languages,
  Volume2,
  VolumeX,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  text: string;
  language: string;
  status: "pending" | "playing" | "completed" | "failed";
  created_at: string;
  voice_style: string;
}

interface AnnouncementQueueProps {
  sessionId: number;
  announcements: Announcement[];
  onAnnouncementRemove: (id: string) => void;
  onAnnouncementSkip: () => void;
  onPlayPause: () => void;
  isPlaying: boolean;
  className?: string;
}

export function AnnouncementQueue({
  sessionId,
  announcements,
  onAnnouncementRemove,
  onAnnouncementSkip,
  onPlayPause,
  isPlaying,
  className,
}: AnnouncementQueueProps) {
  const { toast } = useToast();

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(
        `/api/sessions/${sessionId}/announcements/${id}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to remove announcement");

      onAnnouncementRemove(id);
      toast({
        title: "Success",
        description: "Announcement removed from queue",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove announcement",
      });
    }
  };

  const getStatusIcon = (status: Announcement["status"]) => {
    switch (status) {
      case "playing":
        return <Volume2 className="h-4 w-4 animate-pulse text-primary" />;
      case "completed":
        return <VolumeX className="h-4 w-4 text-muted-foreground" />;
      case "failed":
        return <VolumeX className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Announcement["status"]) => {
    const variants = {
      playing: "default",
      completed: "secondary",
      failed: "destructive",
      pending: "outline",
    };

    return (
      <Badge variant={variants[status] as any} className="gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListMusic className="h-5 w-5" />
          Announcement Queue
        </CardTitle>
        <CardDescription>
          {announcements.length} announcement
          {announcements.length !== 1 ? "s" : ""} in queue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPlayPause}
              className="w-full sm:w-auto gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Play
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAnnouncementSkip}
              disabled={!isPlaying}
              className="w-full sm:w-auto gap-2"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </Button>
          </div>

          <div className="border rounded-md">
            <ScrollArea className="h-[400px] sm:h-[500px]">
              <div className="min-w-[600px] sm:min-w-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead>Text</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Language
                      </TableHead>
                      <TableHead className="w-[60px] sm:w-[100px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell>
                          {getStatusBadge(announcement.status)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] sm:max-w-[300px] truncate">
                            {announcement.text}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="sm:hidden flex items-center gap-1">
                              <Languages className="h-3 w-3" />
                              {announcement.language}
                            </span>
                            <span>Style: {announcement.voice_style}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1">
                            <Languages className="h-4 w-4" />
                            {announcement.language}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(announcement.id)}
                            disabled={announcement.status === "playing"}
                            className="h-8 w-8 sm:h-9 sm:w-9"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {announcements.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-24 sm:h-32 text-center"
                        >
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ListMusic className="h-8 w-8 sm:h-10 sm:w-10" />
                            <p className="text-sm sm:text-base">
                              No announcements in queue
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
