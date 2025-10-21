"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { LearningPath } from '@/types/music_education";
import { Edit, Trash2, BookOpen, Award, Clock } from "lucide-react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface LearningPathCardProps {
  learningPath: LearningPath;
  onEdit: () => void;
  onDelete: () => void;
}

export function LearningPathCard({
  learningPath,
  onEdit,
  onDelete,
}: LearningPathCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const handleViewPath = () => {
    router.push(`/learning-paths/${learningPath.id}`);
  };

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-500/10 text-green-500";
      case "intermediate":
        return "bg-blue-500/10 text-blue-500";
      case "advanced":
        return "bg-purple-500/10 text-purple-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <Card className="group relative">
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-2">{learningPath.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={getSkillLevelColor(learningPath.skill_level)}
        >
          {learningPath.skill_level}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {learningPath.description}
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{learningPath.total_lessons} Lessons</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{learningPath.estimated_weeks} Weeks</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-4 w-4" />
            <span>{learningPath.enrolled_students} Students Enrolled</span>
          </div>
          {learningPath.completion_rate !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span>{Math.round(learningPath.completion_rate)}%</span>
              </div>
              <Progress value={learningPath.completion_rate} />
            </div>
          )}
        </div>
        <Button onClick={handleViewPath} className="w-full">
          View Path
        </Button>
      </CardContent>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Learning Path"
        description="Are you sure you want to delete this learning path? This action cannot be undone and will remove all associated lessons and progress data."
        onConfirm={onDelete}
      />
    </Card>
  );
} 

