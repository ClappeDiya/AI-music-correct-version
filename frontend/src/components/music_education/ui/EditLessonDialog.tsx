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
import { Course, Lesson, musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";

interface EditLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: Lesson;
  course: Course;
  onSuccess: () => void;
}

export function EditLessonDialog({
  open,
  onOpenChange,
  lesson,
  course,
  onSuccess,
}: EditLessonDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_minutes: 30,
    order_in_course: 1,
    content: {
      description: "",
      materials: [],
      practice_exercises: [],
    },
  });

  useEffect(() => {
    if (open && lesson) {
      setFormData({
        title: lesson.title,
        description: lesson.description,
        duration_minutes: lesson.duration_minutes,
        order_in_course: lesson.order_in_course,
        content: lesson.content || {
          description: "",
          materials: [],
          practice_exercises: [],
        },
      });
    }
  }, [open, lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await musicEducationApi.updateLesson(lesson.id, {
        ...formData,
        course_id: course.id,
      });

      toast.success("Lesson updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update lesson:", error);
      toast.error("Failed to update lesson");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Lesson Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter lesson title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter a short description"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Order in Course</Label>
              <Input
                id="order"
                type="number"
                min={1}
                value={formData.order_in_course}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order_in_course: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Detailed Content</Label>
            <Textarea
              id="content"
              value={formData.content.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content: { ...formData.content, description: e.target.value },
                })
              }
              placeholder="Enter detailed lesson content"
              required
              className="min-h-[100px]"
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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 

