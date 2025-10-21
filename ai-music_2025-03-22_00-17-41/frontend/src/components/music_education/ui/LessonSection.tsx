"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search } from "lucide-react";
import { Course, Lesson, musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";
import { LessonCard } from "./lesson-card";
import { CreateLessonDialog } from "./create-lesson-dialog";
import { EditLessonDialog } from "./edit-lesson-dialog";

interface LessonSectionProps {
  course: Course;
}

export function LessonSection({ course }: LessonSectionProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const loadLessons = async () => {
    try {
      const response = await musicEducationApi.getLessons(course.id);
      setLessons(response.data);
    } catch (error) {
      console.error("Failed to load lessons:", error);
      toast.error("Failed to load lessons");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, [course.id]);

  const handleDelete = async (lessonId: string) => {
    try {
      await musicEducationApi.deleteLesson(lessonId);
      toast.success("Lesson deleted successfully");
      loadLessons();
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      toast.error("Failed to delete lesson");
    }
  };

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Course Lessons</CardTitle>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Lesson
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {filteredLessons.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {searchQuery
              ? "No lessons found matching your search"
              : "No lessons added yet"}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onEdit={() => setSelectedLesson(lesson)}
                onDelete={() => handleDelete(lesson.id)}
              />
            ))}
          </div>
        )}
      </CardContent>

      <CreateLessonDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        course={course}
        onSuccess={loadLessons}
      />

      {selectedLesson && (
        <EditLessonDialog
          open={!!selectedLesson}
          onOpenChange={(open) => !open && setSelectedLesson(null)}
          lesson={selectedLesson}
          course={course}
          onSuccess={() => {
            loadLessons();
            setSelectedLesson(null);
          }}
        />
      )}
    </Card>
  );
} 

