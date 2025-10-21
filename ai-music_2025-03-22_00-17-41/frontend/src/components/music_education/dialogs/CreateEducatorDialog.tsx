"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";

interface CreateEducatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EXPERTISE_OPTIONS = [
  "Piano",
  "Guitar",
  "Violin",
  "Voice",
  "Drums",
  "Bass",
  "Music Theory",
  "Composition",
  "Production",
  "Songwriting",
];

export function CreateEducatorDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateEducatorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    bio: "",
    expertise: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await musicEducationApi.createEducator({
        ...formData,
        isVerified: false,
        rating: 0,
        studentCount: 0,
        joinedDate: new Date().toISOString(),
      });
      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Failed to create educator:", error);
      toast.error("Failed to create educator");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      specialization: "",
      bio: "",
      expertise: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Educator</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Expertise</Label>
            <MultiSelect
              options={EXPERTISE_OPTIONS.map((option) => ({
                label: option,
                value: option,
              }))}
              value={formData.expertise.map((exp) => ({
                label: exp,
                value: exp,
              }))}
              onChange={(selected) =>
                setFormData({
                  ...formData,
                  expertise: selected.map((item) => item.value),
                })
              }
              placeholder="Select areas of expertise"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Educator"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 

