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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Course, musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";

interface EditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onSuccess: () => void;
}

const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export function EditCourseDialog({
  open,
  onOpenChange,
  course,
  onSuccess,
}: EditCourseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Course, "id">>({
    course_name: "",
    description: "",
    difficulty: "Beginner",
    duration_minutes: 0,
    prerequisites: "",
    learning_objectives: "",
    total_lessons: 0,
    enrolled_students: 0,
    completion_rate: 0,
  });

  useEffect(() => {
    if (course) {
      setFormData({
        course_name: course.course_name,
        description: course.description,
        difficulty: course.difficulty,
        duration_minutes: course.duration_minutes,
        prerequisites: course.prerequisites,
        learning_objectives: course.learning_objectives,
        total_lessons: course.total_lessons,
        enrolled_students: course.enrolled_students,
        completion_rate: course.completion_rate,
      });
    }
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    
    setIsLoading(true);
    try {
      await musicEducationApi.updateCourse(course.id, formData);
      onSuccess();
    } catch (error) {
      console.error("Failed to update course:", error);
      toast.error("Failed to update course");
    } finally {
      setIsLoading(false);
    }
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course_name">Course Name</Label>
            <Input
              id="course_name"
              value={formData.course_name}
              onChange={(e) =>
                setFormData({ ...formData, course_name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData({ ...formData, difficulty: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={0}
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prerequisites">Prerequisites</Label>
            <Textarea
              id="prerequisites"
              value={formData.prerequisites}
              onChange={(e) =>
                setFormData({ ...formData, prerequisites: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learning_objectives">Learning Objectives</Label>
            <Textarea
              id="learning_objectives"
              value={formData.learning_objectives}
              onChange={(e) =>
                setFormData({ ...formData, learning_objectives: e.target.value })
              }
              rows={3}
              placeholder="What students will learn from this course..."
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

