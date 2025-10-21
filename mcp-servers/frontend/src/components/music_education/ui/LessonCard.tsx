"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  Pencil,
  Trash2,
  BookOpen,
  Clock,
  GraduationCap,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Lesson } from '@/services/music_education/api";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface LessonCardProps {
  lesson: Lesson;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function LessonCard({
  lesson,
  onEdit,
  onDelete,
  className,
}: LessonCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <>
      <Card className={cn("transition-all hover:shadow-md", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>{lesson.title}</span>
              {lesson.is_completed && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {lesson.description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(lesson.duration_minutes)}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>{lesson.total_quizzes} Quizzes</span>
            </div>
          </div>

          {lesson.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{lesson.progress}%</span>
              </div>
              <Progress value={lesson.progress} />
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => router.push(`/music_education/lessons/${lesson.id}`)}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            {lesson.is_completed ? "Review Lesson" : "Start Lesson"}
          </Button>
        </CardContent>
      </Card>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Lesson"
        description="Are you sure you want to delete this lesson? This action cannot be undone and will remove all associated quizzes and student progress."
        onConfirm={onDelete}
      />
    </>
  );
} 

