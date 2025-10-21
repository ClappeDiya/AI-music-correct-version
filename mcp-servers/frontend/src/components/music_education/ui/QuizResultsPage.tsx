"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Quiz,
  QuizAttempt,
  musicEducationApi,
} from '@/services/music_education/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  BarChart2,
  RefreshCw,
} from "lucide-react";
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface QuizResultsPageProps {
  quizId: string;
  attemptId?: string;
}

export function QuizResultsPage({ quizId, attemptId }: QuizResultsPageProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [quizResponse, attemptsResponse] = await Promise.all([
          musicEducationApi.getQuiz(quizId),
          musicEducationApi.getQuizAttempts(quizId),
        ]);

        setQuiz(quizResponse.data);
        setAttempts(attemptsResponse.data);

        if (attemptId) {
          const currentAttempt = attemptsResponse.data.find(
            (a) => a.id === attemptId
          );
          if (currentAttempt) {
            setAttempt(currentAttempt);
          }
        } else if (attemptsResponse.data.length > 0) {
          setAttempt(attemptsResponse.data[0]); // Show latest attempt
        }
      } catch (error) {
        console.error("Failed to load quiz results:", error);
        toast.error("Failed to load quiz results");
        router.push('/music_education/quizzes");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [quizId, attemptId, router]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading || !quiz || !attempt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Results...</CardTitle>
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

  const score = (attempt.correct_answers / quiz.questions.length) * 100;
  const passed = score >= quiz.passing_score;
  const chartData = attempts.map((a) => ({
    date: new Date(a.created_at).toLocaleDateString(),
    score: (a.correct_answers / quiz.questions.length) * 100,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{quiz.title}</CardTitle>
            <Badge
              variant="secondary"
              className={cn(
                "flex items-center",
                passed
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              )}
            >
              {passed ? (
                <CheckCircle2 className="w-4 h-4 mr-1" />
              ) : (
                <XCircle className="w-4 h-4 mr-1" />
              )}
              {passed ? "Passed" : "Failed"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Score</span>
                  </div>
                  <span className="text-2xl font-bold">{Math.round(score)}%</span>
                </div>
                <Progress
                  value={score}
                  className="mt-4"
                  indicatorClassName={cn(
                    passed ? "bg-green-500" : "bg-red-500"
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Correct Answers</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {attempt.correct_answers}/{quiz.questions.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Time Taken</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {formatDuration(attempt.time_taken)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="w-5 h-5 mr-2" />
                Performance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/music_education/quizzes")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quizzes
            </Button>
            <Button
              onClick={() =>
                router.push(`/music_education/quizzes/${quizId}/attempt`)
              }
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 

