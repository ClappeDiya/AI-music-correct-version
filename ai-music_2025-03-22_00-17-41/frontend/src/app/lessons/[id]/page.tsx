"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Lesson, LearningPath } from '@/types/music_education';
import { musicEducationApi } from '@/services/music_education_api';
import { toast } from "sonner";
import { ArrowLeft, Clock, BookOpen, CheckCircle2, HelpCircle } from "lucide-react";
import { QuizSection } from '@/components/music-education/sections/quiz-section';

export default function LessonView() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const lessonData = await musicEducationApi.getLesson(params.id as string);
      const pathData = await musicEducationApi.getLearningPath(lessonData.learning_path_id);
      setLesson(lessonData);
      setLearningPath(pathData);
    } catch (error) {
      toast.error("Failed to load lesson");
      router.push('/learning_paths");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      await musicEducationApi.markLessonComplete(params.id as string);
      loadData();
      toast.success("Lesson marked as complete");
    } catch (error) {
      toast.error("Failed to mark lesson as complete");
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-muted rounded animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!lesson || !learningPath) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/learning-paths/${learningPath.id}`)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{lesson.duration} min</span>
              </div>
              {lesson.practice_exercises > 0 && (
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {lesson.practice_exercises} Exercise
                    {lesson.practice_exercises > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {lesson.is_completed && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">{lesson.description}</p>
        </div>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Lesson Content</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardContent className="p-6 prose prose-slate dark:prose-invert max-w-none">
              {lesson.content}
            </CardContent>
          </Card>

          {!lesson.is_completed && (
            <Button
              onClick={handleComplete}
              disabled={isCompleting}
              className="w-full"
            >
              {isCompleting ? "Marking as Complete..." : "Mark as Complete"}
            </Button>
          )}
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          {lesson.practice_exercises > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Practice Exercises</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Complete these exercises to reinforce your understanding of the
                    lesson material.
                  </p>
                </CardContent>
              </Card>

              <QuizSection lesson={lesson} />
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No practice exercises available for this lesson.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Ask a Question</p>
                  <p className="text-sm text-muted-foreground">
                    Post your question in the community forum or reach out to your
                    mentor for guidance.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Additional Resources</p>
                  <p className="text-sm text-muted-foreground">
                    Check out related lessons and external resources to deepen your
                    understanding.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 