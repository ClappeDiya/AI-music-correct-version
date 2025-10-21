"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Quiz, musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from "@/lib/utils";

interface EditQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: Quiz | null;
  onSuccess: () => void;
}

interface QuizQuestion {
  text: string;
  options: string[];
  correctAnswer: string;
}

export function EditQuizDialog({
  open,
  onOpenChange,
  quiz,
  onSuccess,
}: EditQuizDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Quiz, "id">>({
    title: "",
    description: "",
    time_limit: 30,
    passing_score: 70,
    questions: [],
    lesson: undefined,
    total_questions: 0,
    status: "not_started",
    attempts: 0,
    best_score: 0,
  });

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description,
        time_limit: quiz.time_limit,
        passing_score: quiz.passing_score,
        questions: quiz.questions,
        lesson: quiz.lesson,
        total_questions: quiz.total_questions,
        status: quiz.status,
        attempts: quiz.attempts,
        best_score: quiz.best_score,
      });
    }
  }, [quiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
    
    if (formData.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    setIsLoading(true);
    try {
      await musicEducationApi.updateQuiz(quiz.id, {
        ...formData,
        total_questions: formData.questions.length,
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to update quiz:", error);
      toast.error("Failed to update quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.text || !currentQuestion.correctAnswer) {
      toast.error("Please fill in the question text and select a correct answer");
      return;
    }

    if (currentQuestion.options.some((option) => !option)) {
      toast.error("Please fill in all options");
      return;
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, currentQuestion],
    });

    setCurrentQuestion({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  if (!quiz) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Quiz</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_limit">Time Limit (minutes)</Label>
              <Input
                id="time_limit"
                type="number"
                min={1}
                value={formData.time_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    time_limit: parseInt(e.target.value) || 30,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passing_score">Passing Score (%)</Label>
            <Input
              id="passing_score"
              type="number"
              min={0}
              max={100}
              value={formData.passing_score}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passing_score: parseInt(e.target.value) || 70,
                })
              }
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Questions</Label>
            {formData.questions.map((question, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <p className="font-medium">{question.text}</p>
                      <ul className="space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <li
                            key={optionIndex}
                            className={cn(
                              "text-sm",
                              option === question.correctAnswer &&
                                "text-green-600 font-medium"
                            )}
                          >
                            {option}
                            {option === question.correctAnswer && " (Correct)"}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question_text">Question Text</Label>
                  <Input
                    id="question_text"
                    value={currentQuestion.text}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        text: e.target.value,
                      })
                    }
                    placeholder="Enter your question..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index] = e.target.value;
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: newOptions,
                          });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant={
                          currentQuestion.correctAnswer === option
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswer: option,
                          })
                        }
                      >
                        Correct
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 

