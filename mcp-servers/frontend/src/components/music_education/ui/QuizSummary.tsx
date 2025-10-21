"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, Clock, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { achievementService } from "@/services/AchievementService";
import { MilestoneCelebration } from "./milestone-celebration";

interface QuizSummaryProps {
  quizId: number;
  title: string;
  score: number;
  passingScore: number;
  timeSpent: number;
  totalQuestions: number;
  correctAnswers: number;
  onRetry?: () => void;
  onContinue?: () => void;
  className?: string;
}

export function QuizSummary({
  quizId,
  title,
  score,
  passingScore,
  timeSpent,
  totalQuestions,
  correctAnswers,
  onRetry,
  onContinue,
  className,
}: QuizSummaryProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<any>(null);
  const passed = score >= passingScore;
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  useEffect(() => {
    // Check for achievements when the quiz is completed
    achievementService.checkQuizAchievements(quizId, score, timeSpent);

    // Listen for achievement unlocks
    const handleAchievementUnlock = (event: CustomEvent<any>) => {
      setUnlockedAchievement(event.detail);
      setShowCelebration(true);
    };

    window.addEventListener(
      "achievementUnlocked",
      handleAchievementUnlock as EventListener,
    );

    return () => {
      window.removeEventListener(
        "achievementUnlocked",
        handleAchievementUnlock as EventListener,
      );
    };
  }, [quizId, score, timeSpent]);

  return (
    <>
      <Card className={cn("max-w-2xl mx-auto", className)}>
        <CardHeader>
          <CardTitle className="text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            {passed ? (
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 mx-auto text-red-500" />
            )}
            <h2 className="text-2xl font-bold">
              {passed ? "Congratulations!" : "Keep Practicing!"}
            </h2>
            <p className="text-muted-foreground">
              {passed
                ? "You've passed the quiz successfully!"
                : "You didn't meet the passing score this time. Try again!"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Your Score</span>
                <span className="font-bold">{Math.round(score)}%</span>
              </div>
              <Progress
                value={score}
                className={cn("h-3", passed ? "bg-green-100" : "bg-red-100")}
                indicatorClassName={cn(passed ? "bg-green-500" : "bg-red-500")}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Passing Score: {passingScore}%</span>
                <span>
                  {correctAnswers} of {totalQuestions} correct
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                Time Spent: {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            {onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="min-w-[120px]"
              >
                Try Again
              </Button>
            )}
            {onContinue && (
              <Button onClick={onContinue} className="min-w-[120px]">
                Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showCelebration && unlockedAchievement && (
        <MilestoneCelebration
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          achievement={unlockedAchievement}
          onShare={() => {
            // Handle achievement sharing
          }}
        />
      )}
    </>
  );
}
