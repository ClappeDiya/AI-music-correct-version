"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Course, musicEducationApi } from '@/services/music_education/api';
import { BookOpen, CheckCircle, Clock, FileText, Play, User } from "lucide-react";
import { Plus, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { CreateCourseDialog } from "../dialogs/create-course-dialog";
import { EditCourseDialog } from "../dialogs/edit-course-dialog";
import { CourseCard } from "../ui/course-card";

const DIFFICULTY_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

export function CourseSection({ id }: { id: number }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await musicEducationApi.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error("Failed to load courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    loadCourses();
    toast.success("Course created successfully");
  };

  const handleEditSuccess = () => {
    setSelectedCourse(null);
    loadCourses();
    toast.success("Course updated successfully");
  };

  const handleDelete = async (id: number) => {
    try {
      await musicEducationApi.deleteCourse(id);
      loadCourses();
      toast.success("Course deleted successfully");
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast.error("Failed to delete course");
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty =
      difficultyFilter === "All" || course.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-20 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-muted-foreground h-4 w-4" />
            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEdit={() => setSelectedCourse(course)}
            onDelete={() => handleDelete(course.id)}
          />
        ))}
        {filteredCourses.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-muted-foreground">
              No courses found matching your search criteria.
            </CardContent>
          </Card>
        )}
      </div>

      <CreateCourseDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />

      <EditCourseDialog
        open={!!selectedCourse}
        onOpenChange={() => setSelectedCourse(null)}
        course={selectedCourse}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
} 
