"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useToast } from "@/components/ui/useToast";
import {
  PenTool,
  Clock,
  Plus,
  Save,
  Trash2,
  Languages,
  CheckCircle,
  XCircle,
  Music2,
} from "lucide-react";

interface Collaborator {
  id: string;
  name: string;
  cursorPosition?: number;
  isActive: boolean;
}

interface TimestampedLyric {
  start_time: number;
  text: string;
}

interface LyricsData {
  lyrics_text: string;
  lyrics_with_timestamps: TimestampedLyric[];
  language: string;
  is_verified: boolean;
  source?: string;
}

interface LyricsEditorProps {
  trackId: number;
  className?: string;
  collaborators?: Collaborator[];
  isCollaborative?: boolean;
}

interface SupportedLanguage {
  code: string;
  name: string;
}

export function LyricsEditor({
  trackId,
  className,
  collaborators = [],
  isCollaborative = false,
}: LyricsEditorProps) {
  const { currentLanguage, supportedLanguages } = useLanguageStore();
  const { toast } = useToast();
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [editMode, setEditMode] = useState<"text" | "timestamped">("text");
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastEditRef = useRef<number>(0);

  useEffect(() => {
    loadLyrics();
  }, [trackId, currentLanguage]);

  const loadLyrics = async () => {
    try {
      // This would be replaced with an actual API call
      // For now, use mock data
      // const response = await fetch(
      //   `/api/tracks/${trackId}/lyrics/${currentLanguage}`,
      // );
      // if (!response.ok) throw new Error("Failed to load lyrics");
      // const data = await response.json();
      
      // Mock data for development
      const data = {
        lyrics_text: "Verse 1:\nIn the city lights, we find our way\nThrough the darkness, through the rain\nEvery moment, every day\nWe're searching for something to say\n\nChorus:\nThis is our time, this is our song\nThis is where we belong\nIn the rhythm of the night\nWe'll find our way home",
        lyrics_with_timestamps: [
          { start_time: 0, text: "In the city lights, we find our way" },
          { start_time: 10, text: "Through the darkness, through the rain" },
          { start_time: 20, text: "Every moment, every day" },
          { start_time: 30, text: "We're searching for something to say" },
          { start_time: 40, text: "This is our time, this is our song" },
          { start_time: 50, text: "This is where we belong" },
          { start_time: 60, text: "In the rhythm of the night" },
          { start_time: 70, text: "We'll find our way home" }
        ],
        language: currentLanguage,
        is_verified: true,
        source: "AI Generated"
      };
      
      setLyricsData(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load lyrics",
      });
    }
  };

  const handleSaveLyrics = async () => {
    if (!lyricsData) return;

    try {
      // This would be replaced with an actual API call
      // For now, use mock implementation
      // const response = await fetch(
      //   `/api/tracks/${trackId}/lyrics/${currentLanguage}`,
      //   {
      //     method: "PUT",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       ...lyricsData,
      //       last_edit_timestamp: lastEditRef.current,
      //     }),
      //   },
      // );

      // if (!response.ok) {
      //   const data = await response.json();
      //   if (data.error === "conflict") {
      //     toast({
      //       variant: "destructive",
      //       title: "Edit Conflict",
      //       description:
      //         "Someone else has made changes. Please refresh and try again.",
      //     });
      //     return;
      //   }
      //   throw new Error("Failed to save lyrics");
      // }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: "Lyrics saved successfully",
      });

      setIsEditing(false);
      loadLyrics();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save lyrics",
      });
    }
  };

  const addTimestamp = () => {
    if (!lyricsData) return;

    const newTimestamps = [...(lyricsData.lyrics_with_timestamps || [])];
    newTimestamps.push({
      start_time: newTimestamps.length
        ? newTimestamps[newTimestamps.length - 1].start_time + 30
        : 0,
      text: "",
    });

    setLyricsData({
      ...lyricsData,
      lyrics_with_timestamps: newTimestamps,
    });
    lastEditRef.current = Date.now();
  };

  const updateTimestamp = (
    index: number,
    field: keyof TimestampedLyric,
    value: string | number,
  ) => {
    if (!lyricsData?.lyrics_with_timestamps) return;

    const newTimestamps = [...lyricsData.lyrics_with_timestamps];
    newTimestamps[index] = {
      ...newTimestamps[index],
      [field]: field === "start_time" ? parseFloat(value as string) : value,
    };

    setLyricsData({
      ...lyricsData,
      lyrics_with_timestamps: newTimestamps,
    });
    lastEditRef.current = Date.now();
  };

  const removeTimestamp = (index: number) => {
    if (!lyricsData?.lyrics_with_timestamps) return;

    const newTimestamps = [...lyricsData.lyrics_with_timestamps];
    newTimestamps.splice(index, 1);

    setLyricsData({
      ...lyricsData,
      lyrics_with_timestamps: newTimestamps,
    });
    lastEditRef.current = Date.now();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Render collaboration cursors
  const renderCollaboratorCursors = () => {
    if (!isCollaborative || !textareaRef.current) return null;

    return collaborators.map((collaborator) => {
      if (!collaborator.cursorPosition) return null;

      // Calculate cursor position based on textarea content
      const textarea = textareaRef.current;
      if (!textarea) return null;

      const text = textarea.value;
      const lines = text.substr(0, collaborator.cursorPosition).split("\n");
      const lineNumber = lines.length - 1;
      const charPosition = lines[lineNumber].length;

      return (
        <div
          key={collaborator.id}
          className="absolute pointer-events-none"
          style={{
            top: `${lineNumber * 1.5}em`,
            left: `${charPosition * 0.6}em`,
            backgroundColor: "rgba(var(--color-primary), 0.2)",
          }}
        >
          <div
            className="px-2 py-1 text-xs rounded-md"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            {collaborator.name}
          </div>
        </div>
      );
    });
  };

  const currentLanguageName =
    supportedLanguages.find(
      (lang: SupportedLanguage) => lang.code === currentLanguage,
    )?.name || currentLanguage;

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              Lyrics Editor
              {isCollaborative && (
                <span className="text-sm ml-2">(Collaborative)</span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Languages className="h-4 w-4" />
            {currentLanguageName}
            {lyricsData?.is_verified && (
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle className="h-4 w-4" />
                Verified
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Select
              value={editMode}
              onValueChange={(value: string) =>
                setEditMode(value as "text" | "timestamped")
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select edit mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Plain Text</SelectItem>
                <SelectItem value="timestamped">With Timestamps</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveLyrics}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <PenTool className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {editMode === "text" ? (
            <div className="space-y-4 relative">
              <Textarea
                ref={textareaRef}
                value={lyricsData?.lyrics_text || ""}
                onChange={(e) => {
                  setLyricsData((prev) =>
                    prev
                      ? {
                          ...prev,
                          lyrics_text: e.target.value,
                        }
                      : null,
                  );
                  lastEditRef.current = Date.now();
                }}
                disabled={!isEditing}
                className="min-h-[400px] font-mono"
                placeholder="Enter lyrics text..."
              />
              {renderCollaboratorCursors()}
            </div>
          ) : (
            <div className="border rounded-md p-4 max-h-[500px] overflow-y-auto">
              <div className="space-y-4">
                {isEditing && (
                  <Button onClick={addTimestamp} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Timestamp
                  </Button>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Time</TableHead>
                      <TableHead>Lyrics</TableHead>
                      {isEditing && (
                        <TableHead className="w-[100px]">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lyricsData?.lyrics_with_timestamps?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={item.start_time}
                                onChange={(e) =>
                                  updateTimestamp(
                                    index,
                                    "start_time",
                                    e.target.value,
                                  )
                                }
                                step="0.1"
                                className="w-20"
                              />
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                          ) : (
                            formatTime(item.start_time)
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={item.text}
                              onChange={(e) =>
                                updateTimestamp(index, "text", e.target.value)
                              }
                            />
                          ) : (
                            item.text
                          )}
                        </TableCell>
                        {isEditing && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              onClick={() => removeTimestamp(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {lyricsData?.source && (
            <p className="text-sm text-muted-foreground italic">
              Source: {lyricsData.source}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
