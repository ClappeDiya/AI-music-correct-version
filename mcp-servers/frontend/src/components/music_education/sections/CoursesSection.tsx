"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Course, musicEducationApi } from '@/services/music_education/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";

// Temporary CourseCard component
const CourseCard = ({ 
  course, 
  onEdit, 
  onDelete 
}: { 
  course: Course; 
  onEdit: (course: Course) => void; 
  onDelete: (id: number) => void 
}) => (
  <Card className="h-full">
    <CardHeader className="pb-2">
      <CardTitle className="text-xl">{course.course_name}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {course.description && (
          <p className="text-sm text-muted-foreground">{course.description}</p>
        )}
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(course)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(course.id)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Temporary CreateCourseDialog component
const CreateCourseDialog = ({
  open,
  onOpenChange,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState<Partial<Course>>({
    course_name: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await musicEducationApi.createCourse(formData);
      onSuccess();
      setFormData({
        course_name: '',
        description: ''
      });
      toast.success("Course created successfully");
    } catch (error) {
      console.error("Failed to create course:", error);
      toast.error("Failed to create course");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>Add a new course to your curriculum</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course_name">Course Name</Label>
            <Input
              id="course_name"
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Create Course</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await musicEducationApi.getCourses();
      setCourses(response);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Courses</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Course
        </Button>
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
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onEdit={() => console.log('Edit course')} onDelete={() => console.log('Delete course')} />
          ))}
        </div>
      )}

      <CreateCourseDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          loadCourses();
        }}
      />
    </div>
  );
}
