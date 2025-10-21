"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from "lucide-react";
import { Lesson, Course, musicEducationApi } from '@/services/music_education/api";
import { LessonCard } from "../ui/lesson-card";
import { CreateLessonDialog } from "../dialogs/create-lesson-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';

export function LessonsSection() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadLessons();
    }
  }, [selectedCourse]);

  const loadData = async () => {
    try {
      const coursesResponse = await musicEducationApi.getCourses();
      setCourses(coursesResponse.data);
      if (coursesResponse.data.length > 0) {
        setSelectedCourse(coursesResponse.data[0].id.toString());
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLessons = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    try {
      const response = await musicEducationApi.getLessons();
      setLessons(response.data.filter(lesson => lesson.course === parseInt(selectedCourse)));
    } catch (error) {
      console.error("Failed to load lessons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Lessons</h2>
          <p className="text-muted-foreground">
            Browse and manage course lessons
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Lesson
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="course-select">Select Course</Label>
        <Select
          value={selectedCourse}
          onValueChange={setSelectedCourse}
        >
          <SelectTrigger id="course-select">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.course_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-4"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons
            .sort((a, b) => a.order_in_course - b.order_in_course)
            .map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                course={courses.find((c) => c.id === lesson.course)}
                onUpdate={loadLessons}
              />
            ))}
        </div>
      )}

      <CreateLessonDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        courses={courses}
        selectedCourse={parseInt(selectedCourse)}
        onSuccess={() => {
          setShowCreateDialog(false);
          loadLessons();
        }}
      />
    </div>
  );
} 

