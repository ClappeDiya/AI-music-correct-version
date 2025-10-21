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
import { LearningPath } from '@/types/music_education";
import { musicEducationApi } from '@/services/music_education_api";
import { toast } from "sonner";

interface EditLearningPathDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learningPath: LearningPath;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  skill_level: string;
  estimated_weeks: number;
  prerequisites: string;
  learning_objectives: string[];
  milestones: string[];
}

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export function EditLearningPathDialog({
  open,
  onOpenChange,
  learningPath,
  onSuccess,
}: EditLearningPathDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    skill_level: "Beginner",
    estimated_weeks: 4,
    prerequisites: "",
    learning_objectives: [""],
    milestones: [""],
  });

  useEffect(() => {
    if (learningPath) {
      setFormData({
        title: learningPath.title,
        description: learningPath.description,
        skill_level: learningPath.skill_level,
        estimated_weeks: learningPath.estimated_weeks,
        prerequisites: learningPath.prerequisites,
        learning_objectives: learningPath.learning_objectives.length
          ? learningPath.learning_objectives
          : [""],
        milestones: learningPath.milestones.length
          ? learningPath.milestones
          : [""],
      });
    }
  }, [learningPath]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await musicEducationApi.updateLearningPath(learningPath.id, {
        ...formData,
        learning_objectives: formData.learning_objectives.filter(Boolean),
        milestones: formData.milestones.filter(Boolean),
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update learning path");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddObjective = () => {
    setFormData({
      ...formData,
      learning_objectives: [...formData.learning_objectives, ""],
    });
  };

  const handleRemoveObjective = (index: number) => {
    setFormData({
      ...formData,
      learning_objectives: formData.learning_objectives.filter((_, i) => i !== index),
    });
  };

  const handleAddMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, ""],
    });
  };

  const handleRemoveMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Learning Path</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Music Theory Fundamentals"
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
              placeholder="Describe what students will learn in this path..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skill_level">Skill Level</Label>
              <Select
                value={formData.skill_level}
                onValueChange={(value) =>
                  setFormData({ ...formData, skill_level: value })
                }
              >
                <SelectTrigger id="skill_level">
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_weeks">Estimated Weeks</Label>
              <Input
                id="estimated_weeks"
                type="number"
                min={1}
                value={formData.estimated_weeks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimated_weeks: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prerequisites">Prerequisites</Label>
            <Textarea
              id="prerequisites"
              placeholder="List any prerequisites for this learning path..."
              value={formData.prerequisites}
              onChange={(e) =>
                setFormData({ ...formData, prerequisites: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Learning Objectives</Label>
            {formData.learning_objectives.map((objective, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Objective ${index + 1}`}
                  value={objective}
                  onChange={(e) => {
                    const newObjectives = [...formData.learning_objectives];
                    newObjectives[index] = e.target.value;
                    setFormData({
                      ...formData,
                      learning_objectives: newObjectives,
                    });
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveObjective(index)}
                  disabled={formData.learning_objectives.length === 1}
                >
                  -
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddObjective}
              className="w-full"
            >
              Add Objective
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Milestones</Label>
            {formData.milestones.map((milestone, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Milestone ${index + 1}`}
                  value={milestone}
                  onChange={(e) => {
                    const newMilestones = [...formData.milestones];
                    newMilestones[index] = e.target.value;
                    setFormData({
                      ...formData,
                      milestones: newMilestones,
                    });
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveMilestone(index)}
                  disabled={formData.milestones.length === 1}
                >
                  -
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddMilestone}
              className="w-full"
            >
              Add Milestone
            </Button>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Updating..." : "Update Learning Path"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 

