"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search } from "lucide-react";
import { Lesson, Quiz, musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";
import { QuizCard } from "./quiz-card";
import { CreateQuizDialog } from "./create-quiz-dialog";
import { EditQuizDialog } from "./edit-quiz-dialog";

interface QuizSectionProps {
  lesson: Lesson;
}

export function QuizSection({ lesson }: QuizSectionProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const loadQuizzes = async () => {
    try {
      const response = await musicEducationApi.getQuizzes(lesson.id);
      setQuizzes(response.data);
    } catch (error) {
      console.error("Failed to load quizzes:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [lesson.id]);

  const handleDelete = async (quizId: string) => {
    try {
      await musicEducationApi.deleteQuiz(quizId);
      toast.success("Quiz deleted successfully");
      loadQuizzes();
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lesson Quizzes</CardTitle>
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
          <CardTitle>Lesson Quizzes</CardTitle>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Quiz
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {searchQuery
              ? "No quizzes found matching your search"
              : "No quizzes added yet"}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onEdit={() => setSelectedQuiz(quiz)}
                onDelete={() => handleDelete(quiz.id)}
              />
            ))}
          </div>
        )}
      </CardContent>

      <CreateQuizDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        lesson={lesson}
        onSuccess={loadQuizzes}
      />

      {selectedQuiz && (
        <EditQuizDialog
          open={!!selectedQuiz}
          onOpenChange={(open) => !open && setSelectedQuiz(null)}
          quiz={selectedQuiz}
          lesson={lesson}
          onSuccess={() => {
            loadQuizzes();
            setSelectedQuiz(null);
          }}
        />
      )}
    </Card>
  );
} 

