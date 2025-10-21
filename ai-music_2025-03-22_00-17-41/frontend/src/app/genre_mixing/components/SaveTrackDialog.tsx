"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/useToast";
import { Save, Share2, Copy, Lock, Globe, Users } from "lucide-react";
import { api } from "@/services/api";

interface SaveTrackDialogProps {
  sessionId: string;
  onSaved?: (trackId: string) => void;
  isLoading?: boolean;
}

export type VisibilityType = "private" | "public" | "shared";

interface SaveTrackData {
  title: string;
  description?: string;
  visibility: VisibilityType;
  sharedWith?: string[];
  tags?: string[];
}

export function SaveTrackDialog({
  sessionId,
  onSaved,
  isLoading = false,
}: SaveTrackDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareLink, setShareLink] = useState<string>();
  const [formData, setFormData] = useState<SaveTrackData>({
    title: "",
    description: "",
    visibility: "private",
    sharedWith: [],
    tags: [],
  });

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your track",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.post(
        `/api/genre_mixing/sessions/${sessionId}/save/`,
        {
          ...formData,
          sharedWith:
            formData.visibility === "shared" ? formData.sharedWith : undefined,
        },
      );

      const { trackId, shareUrl } = response.data;

      if (shareUrl) {
        setShareLink(shareUrl);
      }

      toast({
        title: "Success",
        description: "Track saved successfully!",
      });

      onSaved?.(trackId);
    } catch (error) {
      console.error("Failed to save track:", error);
      toast({
        title: "Error",
        description: "Failed to save track. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          disabled={isLoading || isSaving}
        >
          <Save className="h-4 w-4" />
          Save Track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Mixed Track</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter track title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add a description for your track"
            />
          </div>

          <div className="grid gap-2">
            <Label>Visibility</Label>
            <RadioGroup
              value={formData.visibility}
              onValueChange={(value: VisibilityType) =>
                setFormData({ ...formData, visibility: value })
              }
              className="grid gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Private
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Public
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shared" id="shared" />
                <Label htmlFor="shared" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Shared with specific users
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.visibility === "shared" && (
            <div className="grid gap-2">
              <Label htmlFor="sharedWith">
                Share with (comma-separated usernames)
              </Label>
              <Input
                id="sharedWith"
                value={formData.sharedWith?.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sharedWith: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="username1, username2, ..."
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (optional, comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags?.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tags: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="jazz, electronic, experimental, ..."
            />
          </div>

          {shareLink && (
            <div className="grid gap-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyShareLink}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.title.trim()}
              className="gap-2"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save & Share"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
