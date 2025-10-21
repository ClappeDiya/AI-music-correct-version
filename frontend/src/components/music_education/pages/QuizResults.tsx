"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Quiz, QuizAttempt, musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export function QuizResultsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = parseInt(params.quizId as string);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [quizId]);

  const loadResults = async () => {
    try {
      const [quizResponse, attemptResponse] = await Promise.all([
        musicEducationApi.getQuiz(quizId),
        musicEducationApi.getLatestQuizAttempt(quizId),
      ]);
      setQuiz(quizResponse.data);
      setAttempt(attemptResponse.data);
    } catch (error) {
      console.error("Failed to load quiz results:", error);
      toast.error("Failed to load quiz results");
      router.push('/music_education");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !quiz || !attempt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const score = (attempt.score / quiz.questions.length) * 100;
  const passed = score >= quiz.passingScore;

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/music_education")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lessons
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quiz Results: {quiz.title}</CardTitle>
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
            <div className="flex justify-between items-center">
              <span>Your Score</span>
              <span className="font-bold">{Math.round(score)}%</span>
            </div>
            <Progress value={score} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Passing Score: {quiz.passingScore}%</span>
              <span>Time Spent: {Math.round(attempt.timeSpent / 60)} minutes</span>
            </div>
          </div>

          <div className="space-y-6 mt-8">
            <h3 className="text-lg font-semibold">Question Review</h3>
            {quiz.questions.map((question, index) => {
              const userAnswer = attempt.answers.find(
                (a) => a.questionId === question.id
              )?.answer;
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <Card key={question.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          Question {index + 1}: {question.text}
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm">
                            Your Answer:{" "}
                            <span
                              className={
                                isCorrect ? "text-green-500" : "text-red-500"
                              }
                            >
                              {userAnswer}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-green-500">
                              Correct Answer: {question.correctAnswer}
                            </p>
                          )}
                        </div>
                      </div>
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/music_education/quiz/${quizId}`)}
            >
              Retake Quiz
            </Button>
            <Button onClick={() => router.push('/music_education")}>
              Back to Lessons
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 

