"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Music2, Mic, Search, PlayCircle, Plus, History } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  albumArt?: string;
}

interface TrackRequestDialogProps {
  onRequest: (trackId: string) => void;
  onVoiceCommand: (command: string) => void;
  recentTracks?: Track[];
  className?: string;
}

export function TrackRequestDialog({
  onRequest,
  onVoiceCommand,
  recentTracks = [],
  className,
}: TrackRequestDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Implement your search logic here
      const results = await fetch(`/api/tracks/search?q=${query}`);
      const data = await results.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceCommand = async () => {
    try {
      setIsRecording(true);
      // Implement voice recognition logic here
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript;
        onVoiceCommand(command);
      };

      recognition.start();
    } catch (error) {
      console.error("Voice recognition error:", error);
    }
  };

  const TrackItem = ({
    track,
    onSelect,
  }: {
    track: Track;
    onSelect: () => void;
  }) => (
    <div
      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        {track.albumArt ? (
          <img
            src={track.albumArt}
            alt={`${track.title} album art`}
            className="h-10 w-10 rounded-md object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-md bg-accent flex items-center justify-center">
            <Music2 className="h-5 w-5" />
          </div>
        )}
        <div>
          <p className="font-medium">{track.title}</p>
          <p className="text-sm text-muted-foreground">{track.artist}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{track.duration}</span>
        <Plus className="h-4 w-4" />
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn("gap-2", className)}>
          <Music2 className="h-4 w-4" />
          Request Track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request a Track</DialogTitle>
          <DialogDescription>
            Search for a track or use voice commands to make a request
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="search" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="h-4 w-4" />
              Voice Command
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Tracks</Label>
                <Input
                  id="search"
                  placeholder="Enter track name or artist..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {searchResults.map((track) => (
                    <TrackItem
                      key={track.id}
                      track={track}
                      onSelect={() => onRequest(track.id)}
                    />
                  ))}

                  {isSearching && (
                    <div className="flex items-center justify-center py-4">
                      <span className="text-sm text-muted-foreground">
                        Searching...
                      </span>
                    </div>
                  )}

                  {!isSearching &&
                    searchQuery &&
                    searchResults.length === 0 && (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-muted-foreground">
                          No results found
                        </span>
                      </div>
                    )}
                </div>
              </ScrollArea>

              {recentTracks.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Recent Tracks
                  </Label>
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-2">
                      {recentTracks.map((track) => (
                        <TrackItem
                          key={track.id}
                          track={track}
                          onSelect={() => onRequest(track.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Button
                size="lg"
                className={cn(
                  "h-24 w-24 rounded-full",
                  isRecording && "animate-pulse bg-primary",
                )}
                onClick={handleVoiceCommand}
              >
                <Mic
                  className={cn(
                    "h-8 w-8",
                    isRecording && "text-primary-foreground",
                  )}
                />
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {isRecording
                  ? "Listening... Speak your request"
                  : "Click the microphone to start speaking"}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" className="gap-2">
            <PlayCircle className="h-4 w-4" />
            Preview
          </Button>
          <Button type="submit">Request Track</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
