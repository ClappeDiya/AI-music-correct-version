"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Input } from '@/components/ui/Input';
import { Quiz, musicEducationApi } from '@/services/music_education/api';
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

// Temporary QuizCard component
const QuizCard = ({ 
  quiz, 
  onEdit, 
  onDelete 
}: { 
  quiz: Quiz; 
  onEdit: (quiz: Quiz) => void; 
  onDelete: (id: number) => void 
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{quiz.title}</CardTitle>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(quiz)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(quiz.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        {quiz.description && (
          <p className="text-sm text-muted-foreground">{quiz.description}</p>
        )}
        <div className="text-sm">
          <span className="font-medium">{quiz.questions.length}</span> questions
        </div>
      </div>
    </CardContent>
  </Card>
);

// Temporary CreateQuizDialog component
const CreateQuizDialog = ({
  open,
  onOpenChange,
  onSuccess,
  lessonId
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  lessonId?: number;
}) => {
  const [formData, setFormData] = useState<Partial<Quiz>>({
    title: "",
    description: "",
    questions: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await musicEducationApi.createQuiz(formData);
      onSuccess();
      setFormData({ title: "", description: "", questions: [] });
    } catch (error) {
      console.error("Failed to create quiz:", error);
      toast.error("Failed to create quiz");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
          <DialogDescription>Create a new quiz for your students</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <Button type="submit">Create Quiz</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Temporary EditQuizDialog component
const EditQuizDialog = ({
  quiz,
  open,
  onOpenChange,
  onSuccess
}: {
  quiz: Quiz | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState<Partial<Quiz>>({
    title: "",
    description: "",
    questions: []
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description || "",
        questions: [...quiz.questions]
      });
    }
  }, [quiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
    
    try {
      await musicEducationApi.updateQuiz(quiz.id, formData);
      onSuccess();
    } catch (error) {
      console.error("Failed to update quiz:", error);
      toast.error("Failed to update quiz");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Quiz</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface QuizSectionProps {
  lessonId?: number;
  className?: string;
}

export function QuizSection({ lessonId, className }: QuizSectionProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, [lessonId]);

  const loadQuizzes = async () => {
    try {
      const response = await musicEducationApi.getQuizzes();
      setQuizzes(response);
    } catch (error) {
      console.error("Failed to load quizzes:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    loadQuizzes();
    toast.success("Quiz created successfully");
  };

  const handleEditSuccess = () => {
    setSelectedQuiz(null);
    loadQuizzes();
    toast.success("Quiz updated successfully");
  };

  const handleDelete = async (id: number) => {
    try {
      await musicEducationApi.deleteQuiz(id);
      loadQuizzes();
      toast.success("Quiz deleted successfully");
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
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
    <div className={className}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Quiz
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onEdit={() => setSelectedQuiz(quiz)}
              onDelete={() => handleDelete(quiz.id)}
            />
          ))}
          {filteredQuizzes.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center text-muted-foreground">
                No quizzes found matching your search criteria.
              </CardContent>
            </Card>
          )}
        </div>

        <CreateQuizDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          lessonId={lessonId}
          onSuccess={handleCreateSuccess}
        />

        <EditQuizDialog
          open={!!selectedQuiz}
          onOpenChange={() => setSelectedQuiz(null)}
          quiz={selectedQuiz}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  );
} 
