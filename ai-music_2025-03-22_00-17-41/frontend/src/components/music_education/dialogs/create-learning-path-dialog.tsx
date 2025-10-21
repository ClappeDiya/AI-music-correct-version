"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { LearningPath, musicEducationApi } from "@/services/music_education/api";
import { toast } from "sonner";

interface CreateLearningPathDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateLearningPathDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateLearningPathDialogProps) {
  const [formData, setFormData] = useState<Partial<LearningPath>>({
    path_name: '',
    description: '',
    structure: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.path_name) {
        toast.error("Learning path name is required");
        return;
      }
      
      await musicEducationApi.createLearningPath(formData);
      onSuccess();
      setFormData({
        path_name: '',
        description: '',
        structure: {}
      });
      toast.success("Learning path created successfully");
    } catch (error) {
      console.error("Failed to create learning path:", error);
      toast.error("Failed to create learning path");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Learning Path</DialogTitle>
          <DialogDescription>
            Create a new learning path for students to follow.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="path_name">Name</Label>
            <Input
              id="path_name"
              value={formData.path_name}
              onChange={(e) => setFormData({ ...formData, path_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Create Learning Path</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
