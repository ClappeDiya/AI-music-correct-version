"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CoursesSection } from "./sections/CoursesSection";
import { LearningPathsSection } from "./sections/LearningPathsSection";
import { MentoringSection } from "./sections/MentoringSection";
import { AchievementsSection } from "./sections/AchievementsSection";
import { PerformanceSection } from "./sections/PerformanceSection";

export function MusicEducationDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Music Education</h1>
        <p className="text-muted-foreground">
          Explore courses, track your progress, and enhance your musical journey
        </p>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="mentoring">Mentoring</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <CoursesSection />
        </TabsContent>

        <TabsContent value="learning-paths" className="space-y-4">
          <LearningPathsSection />
        </TabsContent>

        <TabsContent value="mentoring" className="space-y-4">
          <MentoringSection />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <AchievementsSection />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
