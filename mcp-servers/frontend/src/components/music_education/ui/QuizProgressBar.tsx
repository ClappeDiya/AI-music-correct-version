"use client";

import { Progress } from "@/components/ui/Progress";
import { cn } from "@/lib/utils";

interface QuizProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining?: number;
  totalTime?: number;
  className?: string;
}

export function QuizProgressBar({
  currentQuestion,
  totalQuestions,
  timeRemaining,
  totalTime,
  className,
}: QuizProgressBarProps) {
  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;
  const timePercentage =
    timeRemaining && totalTime ? (timeRemaining / totalTime) * 100 : null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span>
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        {timeRemaining !== undefined && (
          <span>
            Time Remaining: {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <Progress value={progressPercentage} className="h-2" />
        {timePercentage !== null && (
          <Progress
            value={timePercentage}
            className={cn(
              "h-1",
              timePercentage <= 25 ? "bg-red-200" : "bg-blue-200",
            )}
            indicatorClassName={cn(
              timePercentage <= 25 ? "bg-red-500" : "bg-blue-500",
            )}
          />
        )}
      </div>
    </div>
  );
}
