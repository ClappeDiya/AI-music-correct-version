"use client";

import React, { useState, useEffect } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useToast } from "@/components/ui/useToast";
import {
  FileText,
  Languages,
  Save,
  XCircle,
  PenTool,
  Globe2,
  Music2,
  User,
  Disc3,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackMetadata {
  title: string;
  artist: string;
  album: string;
  description: string;
  genre: string;
  language: string;
  is_original: boolean;
}

interface TrackMetadataEditorProps {
  trackId: number;
  className?: string;
}

export function TrackMetadataEditor({
  trackId,
  className,
}: TrackMetadataEditorProps) {
  const { currentLanguage, supportedLanguages } = useLanguageStore();
  const { toast } = useToast();
  const [metadata, setMetadata] = useState<TrackMetadata | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalLanguage, setOriginalLanguage] = useState<string>("");

  useEffect(() => {
    loadMetadata();
  }, [trackId, currentLanguage]);

  const loadMetadata = async () => {
    try {
      const [metadataResponse, originalResponse] = await Promise.all([
        fetch(`/api/tracks/${trackId}/metadata/${currentLanguage}`),
        fetch(`/api/tracks/${trackId}/original-language`),
      ]);

      if (!metadataResponse.ok || !originalResponse.ok) {
        throw new Error("Failed to load metadata");
      }

      const [metadataData, originalData] = await Promise.all([
        metadataResponse.json(),
        originalResponse.json(),
      ]);

      setMetadata(metadataData);
      setOriginalLanguage(originalData.language);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load track metadata",
      });
    }
  };

  const handleSaveMetadata = async () => {
    if (!metadata) return;

    try {
      const response = await fetch(
        `/api/tracks/${trackId}/metadata/${currentLanguage}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metadata),
        },
      );

      if (!response.ok) throw new Error("Failed to save metadata");

      toast({
        title: "Success",
        description: "Track metadata saved successfully",
      });

      setIsEditing(false);
      loadMetadata();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save track metadata",
      });
    }
  };

  const handleInputChange = (field: keyof TrackMetadata, value: string) => {
    if (!metadata) return;

    setMetadata({
      ...metadata,
      [field]: value,
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Track Metadata Editor
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          {supportedLanguages.find((l) => l.code === currentLanguage)?.name}
          {currentLanguage === originalLanguage && (
            <Badge variant="secondary" className="gap-1">
              <Globe2 className="h-3 w-3" />
              Original Language
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveMetadata}>
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

          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Music2 className="h-4 w-4" />
                Title
              </Label>
              <Input
                id="title"
                value={metadata?.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Artist
              </Label>
              <Input
                id="artist"
                value={metadata?.artist || ""}
                onChange={(e) => handleInputChange("artist", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album" className="flex items-center gap-2">
                <Disc3 className="h-4 w-4" />
                Album
              </Label>
              <Input
                id="album"
                value={metadata?.album || ""}
                onChange={(e) => handleInputChange("album", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Description
              </Label>
              <Textarea
                id="description"
                value={metadata?.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                disabled={!isEditing}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre" className="flex items-center gap-2">
                <Music2 className="h-4 w-4" />
                Genre
              </Label>
              <Input
                id="genre"
                value={metadata?.genre || ""}
                onChange={(e) => handleInputChange("genre", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
