"use client";

import { useEffect, useState } from "react";
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
import { Switch } from '@/components/ui/Switch';
import { Educator, musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";

interface EditEducatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  educator: Educator | null;
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

export function EditEducatorDialog({
  open,
  onOpenChange,
  educator,
  onSuccess,
}: EditEducatorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Educator, "id">>({
    name: "",
    specialization: "",
    bio: "",
    expertise: [],
    isVerified: false,
    rating: 0,
    studentCount: 0,
    joinedDate: "",
  });

  useEffect(() => {
    if (educator) {
      setFormData({
        name: educator.name,
        specialization: educator.specialization,
        bio: educator.bio,
        expertise: educator.expertise,
        isVerified: educator.isVerified,
        rating: educator.rating,
        studentCount: educator.studentCount,
        joinedDate: educator.joinedDate,
      });
    }
  }, [educator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!educator) return;
    
    setIsLoading(true);
    try {
      await musicEducationApi.updateEducator(educator.id, formData);
      onSuccess();
    } catch (error) {
      console.error("Failed to update educator:", error);
      toast.error("Failed to update educator");
    } finally {
      setIsLoading(false);
    }
  };

  if (!educator) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Educator</DialogTitle>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="verified"
              checked={formData.isVerified}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isVerified: checked })
              }
            />
            <Label htmlFor="verified">Verified Educator</Label>
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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 

