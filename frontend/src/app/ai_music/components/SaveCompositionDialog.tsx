"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/usetoast";
import { saveComposition } from "@/app/api/ai-music-generation";

interface SaveCompositionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: string;
  onSaved: (compositionId: string) => void;
}

export function SaveCompositionDialog({
  isOpen,
  onClose,
  trackId,
  onSaved,
}: SaveCompositionDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [versionNotes, setVersionNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your composition",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveComposition({
        trackId,
        title: title.trim(),
        description: description.trim(),
        isPublic,
        versionNotes: versionNotes.trim(),
      });

      toast({
        title: "Composition Saved",
        description: "Your composition has been saved successfully",
      });

      onSaved(result.id);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save composition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Composition</DialogTitle>
          <DialogDescription>
            Save your generated music as a composition. You can create multiple
            versions later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter composition title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="versionNotes">Version Notes</Label>
            <Textarea
              id="versionNotes"
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
              placeholder="Optional notes for this version"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public">Make public</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
