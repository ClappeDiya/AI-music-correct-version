"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"; // Update Card import to use PascalCase
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { LearningPath, Lesson } from '@/types/music_education';
import { musicEducationApi } from '@/services/music_education_api';
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Clock, Award, CheckCircle2 } from "lucide-react";
import { LessonCard } from '@/components/music-education/cards/LessonCard';
import { CreateLessonDialog } from '@/components/music-education/dialogs/create-lesson-dialog';
import { EditLessonDialog } from '@/components/music-education/dialogs/edit-lesson-dialog';

export default function LearningPathView() {
  const params = useParams();
  const router = useRouter();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<{
    completed_lessons: string[];
    completion_percentage: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [pathData, lessonsData, progressData] = await Promise.all([
        musicEducationApi.getLearningPath(params.id as string),
        musicEducationApi.getLessonsForPath(params.id as string),
        musicEducationApi.getUserProgressForPath(params.id as string),
      ]);
      setLearningPath(pathData);
      setLessons(lessonsData);
      setUserProgress(progressData);
    } catch (error) {
      toast.error("Failed to load learning path");
      router.push('/learning_paths");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    loadData();
    toast.success("Lesson created successfully");
  };

  const handleEditSuccess = () => {
    setSelectedLesson(null);
    loadData();
    toast.success("Lesson updated successfully");
  };

  const handleDelete = async (lessonId: string) => {
    try {
      await musicEducationApi.deleteLesson(lessonId);
      loadData();
      toast.success("Lesson deleted successfully");
    } catch (error) {
      toast.error("Failed to delete lesson");
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-500/10 text-green-500";
      case "intermediate":
        return "bg-blue-500/10 text-blue-500";
      case "advanced":
        return "bg-purple-500/10 text-purple-500";
      default:
        return "bg-gray-500/10 text-gray-500";
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!learningPath) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/learning_paths')}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{learningPath.title}</h1>
            <Badge
              variant="secondary"
              className={getSkillLevelColor(learningPath.skill_level)}
            >
              {learningPath.skill_level}
            </Badge>
          </div>
          <p className="text-muted-foreground">{learningPath.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{lessons.length} Lessons</p>
                  <p className="text-xs text-muted-foreground">Total Content</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {learningPath.estimated_weeks} Weeks
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Estimated Duration
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Award className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {learningPath.enrolled_students} Students
                  </p>
                  <p className="text-xs text-muted-foreground">Enrolled</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {learningPath.prerequisites || "No prerequisites required"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                {learningPath.learning_objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {learningPath.milestones.map((milestone, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <CheckCircle2
                      className={`h-5 w-5 mt-0.5 ${
                        userProgress?.completed_lessons.length &&
                        userProgress.completed_lessons.length > index
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span>{milestone}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {userProgress && (
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion</span>
                  <span>{Math.round(userProgress.completion_percentage)}%</span>
                </div>
                <Progress value={userProgress.completion_percentage} />
                <p className="text-sm text-muted-foreground">
                  {userProgress.completed_lessons.length} of {lessons.length}{" "}
                  lessons completed
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Course Content</h2>
            <Button onClick={() => setShowCreateDialog(true)}>Add Lesson</Button>
          </div>

          {lessons.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No lessons available. Add your first lesson to get started!
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  isCompleted={userProgress?.completed_lessons.includes(lesson.id)}
                  onEdit={() => setSelectedLesson(lesson)}
                  onDelete={() => handleDelete(lesson.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateLessonDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        learningPath={learningPath}
        onSuccess={handleCreateSuccess}
      />

      {selectedLesson && (
        <EditLessonDialog
          open={true}
          onOpenChange={() => setSelectedLesson(null)}
          lesson={selectedLesson}
          learningPath={learningPath}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
} 