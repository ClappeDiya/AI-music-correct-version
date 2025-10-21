"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Clock,
  TrendingUp,
  Award,
  BarChart2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { cn } from "@/lib/utils";

export function QuizResultsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = parseInt(params.id as string);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [quizId]);

  const loadData = async () => {
    try {
      const [quizResponse, attemptsResponse] = await Promise.all([
        musicEducationApi.getQuiz(quizId),
        musicEducationApi.getQuizAttempts(quizId),
      ]);
      setQuiz(quizResponse.data);
      setAttempts(attemptsResponse.data);
    } catch (error) {
      console.error("Failed to load quiz results:", error);
      toast.error("Failed to load quiz results");
      router.push('/music_education");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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

  if (!quiz || attempts.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">No Results Found</h2>
              <p className="text-muted-foreground">
                {!quiz
                  ? "The quiz you're looking for doesn't exist."
                  : "You haven't attempted this quiz yet."}
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

  const bestAttempt = attempts.reduce((best, current) =>
    current.score > best.score ? current : best
  );
  const latestAttempt = attempts[attempts.length - 1];
  const averageScore =
    attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length;
  const improvementTrend =
    attempts.length > 1
      ? ((latestAttempt.score - attempts[0].score) / attempts[0].score) * 100
      : 0;

  const chartData = attempts.map((attempt) => ({
    date: formatDate(attempt.date),
    score: attempt.score,
    correctAnswers: attempt.correct_answers,
  }));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          <p className="text-muted-foreground">Performance Analysis</p>
        </div>
        <Button onClick={() => router.push(`/music_education/quizzes/${quiz.id}/attempt`)}>
          Try Again
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Best Score</span>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">{bestAttempt.score}%</div>
              <Progress value={bestAttempt.score} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <BarChart2 className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
              <Progress value={averageScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Improvement</span>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold">
                {improvementTrend > 0 ? "+" : ""}
                {improvementTrend.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Since first attempt
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Attempts</span>
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">{attempts.length}</div>
              <div className="text-sm text-muted-foreground">
                Last attempt: {formatDate(latestAttempt.date)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Score History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
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
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attempt History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attempts.map((attempt, index) => (
              <Card key={index} className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Attempt {attempts.length - index}</span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            attempt.score >= quiz.passing_score
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {attempt.score >= quiz.passing_score ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {attempt.score}%
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(attempt.date)} • Time taken:{" "}
                        {formatDuration(attempt.time_taken)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {attempt.correct_answers} of {quiz.total_questions} correct
                      </div>
                      <Progress
                        value={(attempt.correct_answers / quiz.total_questions) * 100}
                        className="h-1 w-24"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 

