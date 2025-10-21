"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Quiz, QuizAttempt, musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { cn } from "@/lib/utils";

interface QuizAttemptPageProps {
  quizId: string;
}

export function QuizAttemptPage({ quizId }: QuizAttemptPageProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await musicEducationApi.getQuiz(quizId);
        setQuiz(response.data);
        setTimeRemaining(response.data.time_limit * 60); // Convert minutes to seconds
        setSelectedAnswers(new Array(response.data.questions.length).fill(-1));
      } catch (error) {
        console.error("Failed to load quiz:", error);
        toast.error("Failed to load quiz");
        router.push('/music_education/quizzes");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, router]);

  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0 || !quiz) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, quiz]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    setIsSubmitting(true);

    try {
      const response = await musicEducationApi.submitQuizAttempt({
        quiz_id: quizId,
        answers: selectedAnswers,
        time_taken: quiz.time_limit * 60 - (timeRemaining || 0),
      });

      router.push(`/music_education/quizzes/${quizId}/results?attempt=${response.data.id}`);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to submit quiz");
      setIsSubmitting(false);
    }
  };

  if (isLoading || !quiz) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Quiz...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const hasAnsweredCurrent = selectedAnswers[currentQuestionIndex] !== -1;
  const allQuestionsAnswered = selectedAnswers.every((answer) => answer !== -1);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{quiz.title}</CardTitle>
          <Badge
            variant="secondary"
            className={cn(
              "flex items-center space-x-1",
              timeRemaining && timeRemaining <= 60
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            )}
          >
            <Clock className="w-4 h-4 mr-1" />
            {timeRemaining !== null ? formatTime(timeRemaining) : "Time's up!"}
          </Badge>
        </div>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswers[currentQuestionIndex] === index ? "default" : "outline"}
                className="w-full justify-start text-left"
                onClick={() => handleAnswerSelect(index)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              className="flex items-center"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  {allQuestionsAnswered ? (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mr-2" />
                  )}
                  Submit Quiz
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              disabled={!hasAnsweredCurrent}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 

