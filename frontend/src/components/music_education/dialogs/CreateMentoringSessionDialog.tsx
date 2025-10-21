"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Educator } from '@/types/music_education";
import { musicEducationApi } from '@/services/music_education_api";
import { toast } from "sonner";

interface CreateMentoringSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  educators: Educator[];
  onSuccess: () => void;
}

interface FormData {
  educator_id: string;
  scheduled_time: string;
  topics: string;
  notes: string;
}

export function CreateMentoringSessionDialog({
  open,
  onOpenChange,
  educators,
  onSuccess,
}: CreateMentoringSessionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    educator_id: "",
    scheduled_time: "",
    topics: "",
    notes: "",
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await musicEducationApi.createMentoringSession(formData);
      toast.success("Mentoring session scheduled successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        educator_id: "",
        scheduled_time: "",
        topics: "",
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to schedule mentoring session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Mentoring Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Educator</Label>
            <Select
              value={formData.educator_id}
              onValueChange={(value) =>
                setFormData({ ...formData, educator_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an educator" />
              </SelectTrigger>
              <SelectContent>
                {educators.map((educator) => (
                  <SelectItem key={educator.id} value={educator.id}>
                    {educator.name} - {educator.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Scheduled Time</Label>
            <Input
              type="datetime-local"
              value={formData.scheduled_time}
              onChange={(e) =>
                setFormData({ ...formData, scheduled_time: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Topics to Discuss</Label>
            <Input
              placeholder="e.g., Music Theory, Technique, Performance"
              value={formData.topics}
              onChange={(e) =>
                setFormData({ ...formData, topics: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              placeholder="Any specific questions or areas you'd like to focus on..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Scheduling..." : "Schedule Session"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 

