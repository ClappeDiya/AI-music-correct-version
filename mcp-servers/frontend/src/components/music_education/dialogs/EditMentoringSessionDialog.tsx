"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Educator } from '@/types/music_education";
import { musicEducationApi } from '@/services/music_education_api";
import { toast } from "sonner";

interface EditMentoringSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: {
    id: string;
    educator_id: string;
    scheduled_time: string;
    topics: string;
    notes: string;
    status: "scheduled" | "completed" | "cancelled";
  };
  educator: Educator;
  onSuccess: () => void;
}

interface FormData {
  scheduled_time: string;
  topics: string;
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
}

export function EditMentoringSessionDialog({
  open,
  onOpenChange,
  session,
  educator,
  onSuccess,
}: EditMentoringSessionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    scheduled_time: "",
    topics: "",
    notes: "",
    status: "scheduled",
  });

  useEffect(() => {
    if (session) {
      setFormData({
        scheduled_time: session.scheduled_time,
        topics: session.topics,
        notes: session.notes,
        status: session.status,
      });
    }
  }, [session]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await musicEducationApi.updateMentoringSession(session.id, formData);
      toast.success("Mentoring session updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update mentoring session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Mentoring Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Educator</Label>
            <div className="p-2 bg-muted rounded-md">
              {educator.name} - {educator.specialization}
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              aria-label="Session status"
              className="w-full p-2 border rounded-md"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "scheduled" | "completed" | "cancelled",
                })
              }
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Updating..." : "Update Session"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 

