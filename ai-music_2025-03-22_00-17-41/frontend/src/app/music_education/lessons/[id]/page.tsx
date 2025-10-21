"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LessonContent } from '@/components/music-education/ui/LessonContent';
import { musicEducationApi } from '@/services/music_education/api';
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"; // Update Card import to use PascalCase
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart } from "@/components/ui/LineChart";
import {
  ArrowLeft,
  Clock,
  Activity,
  Users,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = parseInt(params.id as string);

  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<{
    totalWatchTime: number;
    completionRate: number;
    mostWatchedSegments: { start: number; end: number; count: number }[];
    averageEngagement: number;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [lessonId]);

  const loadData = async () => {
    try {
      const [lessonResponse, analyticsResponse] = await Promise.all([
        musicEducationApi.getLesson(lessonId),
        musicEducationApi.getVideoAnalytics(lessonId),
      ]);
      setLesson(lessonResponse.data);
      setAnalytics(analyticsResponse);
    } catch (error) {
      console.error("Failed to load lesson data:", error);
      toast.error("Failed to load lesson");
      router.push('/music_education");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLessonComplete = async () => {
    try {
      await musicEducationApi.updateUserProgress({
        lessonId,
        status: "completed",
        progress: 100,
      });
      toast.success("Lesson completed!");
      router.push('/music_education");
    } catch (error) {
      console.error("Failed to update progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const handleUpdateWatchHistory = async (sectionId: number, progress: number) => {
    try {
      await musicEducationApi.updateWatchHistory({
        lessonId,
        sectionId,
        progress,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Failed to update watch history:", error);
    }
  };

  const handleAddNote = async (sectionId: number, note: { timestamp: number; text: string }) => {
    try {
      await musicEducationApi.addVideoNote({
        lessonId,
        sectionId,
        timestamp: note.timestamp,
        text: note.text,
      });
      toast.success("Note added successfully");
      loadData(); // Reload to get updated notes
    } catch (error) {
      console.error("Failed to add note:", error);
      toast.error("Failed to add note");
    }
  };

  const handleVideoAnalytics = async (event: {
    event: 'play' | 'pause' | 'seek' | 'complete';
    timestamp: number;
    duration?: number;
  }) => {
    try {
      await musicEducationApi.updateVideoAnalytics({
        lessonId,
        sectionId: 0, // This would need to be passed down from the section context
        ...event,
      });
    } catch (error) {
      console.error("Failed to update video analytics:", error);
    }
  };

  if (isLoading || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/music_education')}
          className="rounded-full p-2 hover:bg-secondary transition-colors"
          aria-label="Back to Music Education"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LessonContent
            lesson={lesson}
            onComplete={handleLessonComplete}
            onUpdateWatchHistory={handleUpdateWatchHistory}
            onAddNote={handleAddNote}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Video Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {analytics ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Watch Time</div>
                      <div className="text-2xl font-bold">
                        {Math.round(analytics.totalWatchTime / 60)}m
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Completion</div>
                      <div className="text-2xl font-bold">
                        {Math.round(analytics.completionRate * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Engagement</div>
                    <Progress value={analytics.averageEngagement * 100} />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Most Watched Segments</div>
                    <div className="h-[100px]">
                      <LineChart
                        data={analytics.mostWatchedSegments.map((segment) => ({
                          time: `${Math.floor(segment.start / 60)}:${(segment.start % 60)
                            .toString()
                            .padStart(2, "0")}`,
                          views: segment.count,
                        }))}
                        title="Segment Views"
                        lines={[
                          {
                            name: "Views",
                            dataKey: "views",
                            stroke: "#2563eb",
                          },
                        ]}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  No analytics data available yet
                </div>
              )}
            </CardContent>
          </Card>

          {lesson.watchHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Watch History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Last Watched</div>
                  <div>
                    {new Date(lesson.watchHistory.lastWatched).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Progress</div>
                  <Progress value={lesson.watchHistory.progress} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 