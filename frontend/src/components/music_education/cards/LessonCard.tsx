"use client";

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Lesson } from '@/types/music_education";
import { Edit, Trash2, PlayCircle, CheckCircle2 } from "lucide-react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface LessonCardProps {
  lesson: Lesson;
  isCompleted?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function LessonCard({
  lesson,
  isCompleted = false,
  onEdit,
  onDelete,
}: LessonCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const handleViewLesson = () => {
    router.push(`/lessons/${lesson.id}`);
  };

  return (
    <Card className="group relative">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-start gap-3">
              <div
                className={`rounded-full p-1.5 ${
                  isCompleted ? "bg-green-500/10" : "bg-muted"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2
                    className="h-4 w-4 text-green-500"
                    aria-label="Completed"
                  />
                ) : (
                  <PlayCircle
                    className="h-4 w-4 text-muted-foreground"
                    aria-label="Not completed"
                  />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-medium leading-none">{lesson.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {lesson.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="bg-muted">
                  {lesson.duration} min
                </Badge>
              </div>
              {lesson.quiz_count > 0 && (
                <Badge variant="secondary" className="bg-muted">
                  {lesson.quiz_count} Quiz{lesson.quiz_count > 1 ? "zes" : ""}
                </Badge>
              )}
              {lesson.practice_exercises > 0 && (
                <Badge variant="secondary" className="bg-muted">
                  {lesson.practice_exercises} Exercise
                  {lesson.practice_exercises > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            {lesson.completion_rate !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Student Progress</span>
                  <span className="text-muted-foreground">
                    {Math.round(lesson.completion_rate)}%
                  </span>
                </div>
                <Progress value={lesson.completion_rate} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
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
        <Button
          onClick={handleViewLesson}
          className="w-full mt-4"
          variant={isCompleted ? "outline" : "default"}
        >
          {isCompleted ? "Review Lesson" : "Start Lesson"}
        </Button>
      </CardContent>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Lesson"
        description="Are you sure you want to delete this lesson? This action cannot be undone and will remove all associated quizzes, exercises, and student progress data."
        onConfirm={onDelete}
      />
    </Card>
  );
} 

