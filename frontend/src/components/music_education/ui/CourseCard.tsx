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
  Users,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from '@/services/music_education/api";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CourseCardProps {
  course: Course;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function CourseCard({
  course,
  onEdit,
  onDelete,
  className,
}: CourseCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    Advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  };

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
              <span>{course.course_name}</span>
              <Badge
                variant="secondary"
                className={difficultyColors[course.difficulty as keyof typeof difficultyColors]}
              >
                {course.difficulty}
              </Badge>
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
            {course.description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{course.total_lessons} Lessons</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(course.duration_minutes)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{course.enrolled_students} Students</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>{course.completion_rate}% Completion</span>
            </div>
          </div>

          {course.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Your Progress</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} />
            </div>
          )}

          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push(`/music_education/courses/${course.id}`)}
          >
            View Course
          </Button>
        </CardContent>
      </Card>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Course"
        description="Are you sure you want to delete this course? This action cannot be undone and will remove all associated lessons and student progress."
        onConfirm={onDelete}
      />
    </>
  );
} 

