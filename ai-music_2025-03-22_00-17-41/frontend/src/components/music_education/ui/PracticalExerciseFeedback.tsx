"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { cn } from "@/lib/utils";
import { PracticalSubmission } from '@/types/music_education";
import {
  CheckCircle2,
  HelpCircle,
  Info,
  Music,
  Star,
  XCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

interface PracticalExerciseFeedbackProps {
  submission: PracticalSubmission;
  className?: string;
}

export function PracticalExerciseFeedback({
  submission,
  className,
}: PracticalExerciseFeedbackProps) {
  if (!submission.feedback) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="py-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <Info className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Feedback not available yet</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overallScore, criteriaScores, comments, suggestions } = submission.feedback;
  const isPassing = overallScore >= 70;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-xl sm:text-2xl">Exercise Feedback</CardTitle>
          <Badge
            variant="secondary"
            className={cn(
              "flex items-center gap-1 w-fit",
              isPassing
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            )}
          >
            {isPassing ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {Math.round(overallScore)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm sm:text-base">
            <span>Overall Progress</span>
            <span>{Math.round(overallScore)}%</span>
          </div>
          <Progress
            value={overallScore}
            className="h-2"
            indicatorClassName={cn(
              isPassing ? "bg-green-500" : "bg-red-500"
            )}
          />
        </div>

        {/* Criteria Scores */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm sm:text-base">Evaluation Criteria</h3>
          <div className="space-y-4">
            {criteriaScores.map((criteria, index) => (
              <div key={index} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm sm:text-base break-words">{criteria.criteriaName}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm break-words">{criteria.feedback}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span
                    className={cn(
                      "font-medium text-sm sm:text-base",
                      criteria.score >= 70
                        ? "text-green-500"
                        : "text-red-500"
                    )}
                  >
                    {criteria.score}%
                  </span>
                </div>
                <Progress
                  value={criteria.score}
                  className="h-1.5"
                  indicatorClassName={cn(
                    criteria.score >= 70
                      ? "bg-green-500"
                      : "bg-red-500"
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm sm:text-base">Instructor Comments</h3>
          <p className="text-sm sm:text-base text-muted-foreground break-words">{comments}</p>
        </div>

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm sm:text-base">Suggestions for Improvement</h3>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm sm:text-base text-muted-foreground"
                >
                  <Star className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span className="break-words">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Submission Details */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-sm sm:text-base text-muted-foreground">Submitted</span>
            <span className="text-sm sm:text-base text-muted-foreground">{new Date(submission.submittedAt).toLocaleString()}</span>
          </div>
          {submission.evaluatedAt && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-sm sm:text-base text-muted-foreground">Evaluated</span>
              <span className="text-sm sm:text-base text-muted-foreground">{new Date(submission.evaluatedAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Media Preview */}
        {(submission.audioUrl || submission.screenshotUrls) && (
          <div className="pt-4 border-t space-y-4">
            <h3 className="font-medium text-sm sm:text-base">Submission Media</h3>
            
            {submission.audioUrl && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base font-medium">Audio Recording</span>
                </div>
                <audio
                  src={submission.audioUrl}
                  controls
                  className="w-full"
                />
              </div>
            )}

            {submission.screenshotUrls && submission.screenshotUrls.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm sm:text-base font-medium">Screenshots</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {submission.screenshotUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden border"
                    >
                      <img
                        src={url}
                        alt={`Screenshot ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 

