"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { LearningPath } from '@/types/music_education";
import { musicEducationApi } from '@/services/music_education_api";
import { toast } from "sonner";

interface CreateLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learningPath: LearningPath;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  duration: number;
  order_in_path: number;
  content: string;
  practice_exercises: number;
}

export function CreateLessonDialog({
  open,
  onOpenChange,
  learningPath,
  onSuccess,
}: CreateLessonDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    duration: 30,
    order_in_path: 1,
    content: "",
    practice_exercises: 0,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: 30,
      order_in_path: 1,
      content: "",
      practice_exercises: 0,
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await musicEducationApi.createLesson(learningPath.id, formData);
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to create lesson");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Lesson</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Introduction to Music Theory"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn in this lesson..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_in_path">Order in Path</Label>
              <Input
                id="order_in_path"
                type="number"
                min={1}
                value={formData.order_in_path}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order_in_path: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Lesson Content</Label>
            <Textarea
              id="content"
              placeholder="Write the lesson content here..."
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="min-h-[200px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="practice_exercises">Number of Practice Exercises</Label>
            <Input
              id="practice_exercises"
              type="number"
              min={0}
              value={formData.practice_exercises}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  practice_exercises: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Creating..." : "Create Lesson"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 

