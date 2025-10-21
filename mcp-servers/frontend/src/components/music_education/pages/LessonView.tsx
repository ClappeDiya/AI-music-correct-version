"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Lesson, Course, UserProgress, musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Music,
  Video,
} from "lucide-react";
import { QuizSection } from "../sections/quiz-section";

export function LessonView() {
  const router = useRouter();
  const params = useParams();
  const lessonId = parseInt(params.id as string);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    loadData();
  }, [lessonId]);

  const loadData = async () => {
    try {
      const [lessonResponse, progressResponse] = await Promise.all([
        musicEducationApi.getLesson(lessonId),
        musicEducationApi.getUserProgress(),
      ]);

      setLesson(lessonResponse.data);
      setProgress(progressResponse.data);

      const courseResponse = await musicEducationApi.getCourse(
        lessonResponse.data.course
      );
      setCourse(courseResponse.data);
    } catch (error) {
      console.error("Failed to load lesson data:", error);
      toast.error("Failed to load lesson data");
      router.push('/music_education");
    } finally {
      setIsLoading(false);
    }
  };

  const markLessonComplete = async () => {
    try {
      await musicEducationApi.updateUserProgress({
        ...progress,
        completedLessons: [...(progress?.completedLessons || []), lessonId],
      });
      toast.success("Lesson marked as complete");
      loadData();
    } catch (error) {
      console.error("Failed to mark lesson as complete:", error);
      toast.error("Failed to mark lesson as complete");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-[400px] bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Lesson Not Found</h2>
              <p className="text-muted-foreground">
                The lesson you're looking for doesn't exist or you don't have
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

  const isCompleted = progress?.completedLessons.includes(lessonId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/music_education")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{lesson.lesson_title}</h1>
            <p className="text-muted-foreground">
              Lesson {lesson.order_in_course} in {course.course_name}
            </p>
          </div>
        </div>
        {!isCompleted && (
          <Button onClick={markLessonComplete}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark as Complete
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="content">
                <FileText className="w-4 h-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="materials">
                <Video className="w-4 h-4 mr-2" />
                Materials
              </TabsTrigger>
              <TabsTrigger value="practice">
                <Music className="w-4 h-4 mr-2" />
                Practice
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose dark:prose-invert max-w-none">
                    {lesson.content?.description && (
                      <div dangerouslySetInnerHTML={{ __html: lesson.content.description }} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  {lesson.content?.materials && lesson.content.materials.length > 0 ? (
                    <div className="grid gap-4">
                      {lesson.content.materials.map((material: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="flex-1">
                                <h3 className="font-medium">{material.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {material.description}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No materials available for this lesson.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practice" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Practice Exercises</CardTitle>
                </CardHeader>
                <CardContent>
                  {lesson.content?.exercises ? (
                    <div className="grid gap-4">
                      {lesson.content.exercises.map((exercise: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="flex-1">
                                <h3 className="font-medium">{exercise.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {exercise.description}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                Start
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No practice exercises available for this lesson.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <QuizSection lessonId={lessonId} />
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Course Progress</span>
                  <span className="font-medium">
                    {Math.round((progress?.completedLessons.length || 0) / course.total_lessons * 100)}%
                  </span>
                </div>
                <Progress
                  value={(progress?.completedLessons.length || 0) / course.total_lessons * 100}
                />
              </div>

              <div className="flex items-center space-x-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Time Spent</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((progress?.totalTimeSpent || 0) / 60)} hours
                  </p>
                </div>
              </div>

              {isCompleted && (
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Lesson Completed</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you're stuck or have questions, you can schedule a mentoring
                session with one of our educators.
              </p>
              <Button className="w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                Schedule Mentoring
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 

