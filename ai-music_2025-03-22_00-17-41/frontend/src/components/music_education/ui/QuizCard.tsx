"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  Pencil,
  Trash2,
  Clock,
  Award,
  PlayCircle,
  CheckCircle2,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Quiz } from '@/services/music_education/api";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface QuizCardProps {
  quiz: Quiz;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function QuizCard({
  quiz,
  onEdit,
  onDelete,
  className,
}: QuizCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatDuration = (minutes: number) => {
    return `${minutes} min`;
  };

  const getStatusBadge = () => {
    if (quiz.best_score === 100) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Perfect Score
        </Badge>
      );
    } else if (quiz.best_score >= quiz.passing_score) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Award className="w-3 h-3 mr-1" />
          Passed
        </Badge>
      );
    } else if (quiz.attempts > 0) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    return null;
  };

  return (
    <>
      <Card className={cn("transition-all hover:shadow-md", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>{quiz.title}</span>
              {getStatusBadge()}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {quiz.attempts > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/music_education/quizzes/${quiz.id}/results`)}
                >
                  <BarChart2 className="h-4 w-4" />
                </Button>
              )}
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
            {quiz.description}
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(quiz.time_limit)}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>{quiz.passing_score}% to pass</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <BarChart2 className="h-4 w-4" />
              <span>{quiz.attempts || 0} attempts</span>
            </div>
          </div>

          {quiz.best_score !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Best Score</span>
                <span>{quiz.best_score}%</span>
              </div>
              <Progress value={quiz.best_score} />
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => router.push(`/music_education/quizzes/${quiz.id}/attempt`)}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            {quiz.attempts > 0 ? "Retry Quiz" : "Start Quiz"}
          </Button>
        </CardContent>
      </Card>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Quiz"
        description="Are you sure you want to delete this quiz? This action cannot be undone and will remove all student attempts and scores."
        onConfirm={onDelete}
      />
    </>
  );
} 

