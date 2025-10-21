"use client";

import { Card, CardContent } from '@/components/ui/Card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from "@/lib/utils";
import { Question, QuestionFeedback } from '@/types/music_education";
import { AlertCircle, CheckCircle, HelpCircle, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

interface QuizQuestionProps {
  question: Question;
  userAnswer?: string | boolean;
  showFeedback?: boolean;
  feedback?: QuestionFeedback;
  onChange?: (answer: string | boolean) => void;
  className?: string;
}

export function QuizQuestion({
  question,
  userAnswer,
  showFeedback = false,
  feedback,
  onChange,
  className,
}: QuizQuestionProps) {
  const renderQuestionInput = () => {
    switch (question.type) {
      case "multiple-choice":
        return (
          <RadioGroup
            value={userAnswer as string}
            onValueChange={onChange}
            className="space-y-3 w-full"
          >
            {question.options.map((option, index) => {
              const isCorrect =
                showFeedback && option === question.correctAnswer;
              const isIncorrect =
                showFeedback &&
                userAnswer === option &&
                option !== question.correctAnswer;

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors",
                    isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                    isIncorrect && "border-red-500 bg-red-50 dark:bg-red-950"
                  )}
                >
                  <RadioGroupItem
                    value={option}
                    id={`option-${question.id}-${index}`}
                    disabled={showFeedback}
                    className="flex-shrink-0 w-5 h-5"
                  />
                  <Label
                    htmlFor={`option-${question.id}-${index}`}
                    className={cn(
                      "flex-1 cursor-pointer text-base leading-relaxed py-0.5",
                      isCorrect && "text-green-500",
                      isIncorrect && "text-red-500"
                    )}
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        );

      case "true-false":
        return (
          <div className="flex flex-col gap-3 w-full sm:flex-row sm:gap-4">
            <Button
              variant={userAnswer === true ? "default" : "outline"}
              onClick={() => onChange?.(true)}
              disabled={showFeedback}
              className={cn(
                "flex-1 sm:flex-none sm:w-32 h-12 text-base",
                showFeedback &&
                  question.correctAnswer === true &&
                  "bg-green-500 hover:bg-green-500",
                showFeedback &&
                  userAnswer === true &&
                  question.correctAnswer === false &&
                  "bg-red-500 hover:bg-red-500"
              )}
            >
              True
            </Button>
            <Button
              variant={userAnswer === false ? "default" : "outline"}
              onClick={() => onChange?.(false)}
              disabled={showFeedback}
              className={cn(
                "flex-1 sm:flex-none sm:w-32 h-12 text-base",
                showFeedback &&
                  question.correctAnswer === false &&
                  "bg-green-500 hover:bg-green-500",
                showFeedback &&
                  userAnswer === false &&
                  question.correctAnswer === true &&
                  "bg-red-500 hover:bg-red-500"
              )}
            >
              False
            </Button>
          </div>
        );

      case "fill-in-blank":
        return (
          <div className="space-y-3 w-full">
            <Input
              type="text"
              value={userAnswer as string}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={showFeedback}
              placeholder="Type your answer here..."
              className={cn(
                "w-full text-base h-12 px-4",
                showFeedback &&
                  feedback?.correct &&
                  "border-green-500 focus-visible:ring-green-500",
                showFeedback &&
                  !feedback?.correct &&
                  "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {showFeedback && (
              <div className="text-base flex flex-wrap items-center gap-3 bg-accent/50 p-4 rounded-lg">
                <span className="font-medium min-w-[120px]">Correct Answer: </span>
                <span className="break-all flex-1">{question.correctAnswer}</span>
                {question.acceptableAnswers && question.acceptableAnswers.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <HelpCircle className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs p-4">
                        <p className="font-medium mb-2">Also accepted:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {question.acceptableAnswers.map((answer, index) => (
                            <li key={index} className="break-all text-base">{answer}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Card className={cn("w-full transition-all", className)}>
      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <p className="font-medium flex-1 text-base leading-relaxed">{question.text}</p>
          {showFeedback && (
            <div
              className={cn(
                "rounded-full p-2 flex-shrink-0",
                feedback?.correct
                  ? "bg-green-100 text-green-500"
                  : "bg-red-100 text-red-500"
              )}
            >
              {feedback?.correct ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <XCircle className="h-6 w-6" />
              )}
            </div>
          )}
        </div>

        <div className="pt-2">{renderQuestionInput()}</div>

        {showFeedback && feedback && (
          <div
            className={cn(
              "rounded-lg p-4 sm:p-5 text-base space-y-4",
              feedback.correct
                ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
            )}
          >
            <p className="font-medium break-words leading-relaxed">{feedback.explanation}</p>
            {feedback.suggestions && feedback.suggestions.length > 0 && (
              <div className="space-y-3">
                <p className="font-medium">Suggestions for improvement:</p>
                <ul className="list-disc list-inside space-y-2">
                  {feedback.suggestions.map((suggestion, index) => (
                    <li key={index} className="break-words leading-relaxed">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.relatedConcepts && feedback.relatedConcepts.length > 0 && (
              <div className="space-y-3">
                <p className="font-medium">Related concepts to review:</p>
                <div className="flex flex-wrap gap-2">
                  {feedback.relatedConcepts.map((concept, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300 break-words"
                    >
                      {concept}
                    </span>
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

