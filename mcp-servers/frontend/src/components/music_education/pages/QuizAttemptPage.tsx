"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Quiz, QuizAttempt, musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { QuizProgressBar } from "../ui/quiz-progress-bar";
import { QuizQuestion } from "../ui/quiz-question";
import { QuizSummary } from "../ui/quiz-summary";

export function QuizAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = parseInt(params.id as string);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz && !attempt) {
      setTimeRemaining(quiz.time_limit * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeRemaining > 0 && !attempt) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, attempt]);

  const loadQuiz = async () => {
    try {
      const response = await musicEducationApi.getQuiz(quizId);
      setQuiz(response.data);
      setUserAnswers(new Array(response.data.questions.length).fill(""));
    } catch (error) {
      console.error("Failed to load quiz:", error);
      toast.error("Failed to load quiz");
      router.push('/music_education");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    setIsSubmitting(true);
    try {
      const response = await musicEducationApi.submitQuizAttempt({
        quiz_id: quiz.id,
        answers: userAnswers,
        time_taken: quiz.time_limit * 60 - timeRemaining,
      });
      setAttempt(response.data);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-[400px] bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Quiz Not Found</h2>
              <p className="text-muted-foreground">
                The quiz you're looking for doesn't exist or you don't have
                access to it.
              </p>
              <Button onClick={() => router.push('/music_education")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Music Education
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (attempt) {
    return (
      <div className="container mx-auto py-6">
        <QuizSummary
          title={quiz.title}
          score={attempt.score}
          passingScore={quiz.passing_score}
          timeSpent={attempt.time_taken}
          totalQuestions={quiz.questions.length}
          correctAnswers={attempt.correct_answers}
          onRetry={() => router.refresh()}
          onContinue={() => router.push('/music_education")}
        />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const hasAnsweredCurrent = !!userAnswers[currentQuestionIndex];
  const hasAnsweredAll = userAnswers.every((answer) => answer);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <QuizProgressBar
            currentQuestion={currentQuestionIndex}
            totalQuestions={quiz.questions.length}
            timeRemaining={timeRemaining}
            totalTime={quiz.time_limit * 60}
          />

          <QuizQuestion
            question={currentQuestion}
            userAnswer={userAnswers[currentQuestionIndex]}
            onChange={handleAnswerChange}
          />

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!hasAnsweredAll || isSubmitting}
              >
                <Check className="w-4 h-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!hasAnsweredCurrent}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 

