"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { QuizAttempt, musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

export function QuizResultsView() {
  const router = useRouter();
  const params = useParams();
  const quizId = parseInt(params.id as string);

  const [results, setResults] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [quizId]);

  const loadResults = async () => {
    try {
      const response = await musicEducationApi.getQuizAttemptResults(quizId);
      setResults(response.data);
    } catch (error) {
      console.error("Failed to load quiz results:", error);
      toast.error("Failed to load quiz results");
      router.push('/music_education");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/music_education")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lessons
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span>Score</span>
              <span className="font-bold">{results.score}%</span>
            </div>
            <Progress value={results.score} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {results.answers.map((answer, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <p className="text-sm text-muted-foreground">{answer.question}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Your Answer:</span>
                      <span className="text-sm">{answer.userAnswer}</span>
                      {answer.isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    {!answer.isCorrect && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Correct Answer:</span>
                        <span className="text-sm text-green-600">{answer.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/music_education")}
            >
              Back to Lessons
            </Button>
            <Button
              onClick={() => router.push(`/music_education/quiz/${quizId}`)}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 

