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
import { Lesson, Quiz, musicEducationApi } from '@/services/music_education/api";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from '@/components/ui/Card';

interface EditQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: Quiz;
  lesson: Lesson;
  onSuccess: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_option: number;
}

export function EditQuizDialog({
  open,
  onOpenChange,
  quiz,
  lesson,
  onSuccess,
}: EditQuizDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time_limit: 15,
    passing_score: 70,
    questions: [] as QuizQuestion[],
  });

  useEffect(() => {
    if (open && quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description,
        time_limit: quiz.time_limit,
        passing_score: quiz.passing_score,
        questions: quiz.questions || [],
      });
    }
  }, [open, quiz]);

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correct_option: 0,
        },
      ],
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...formData.questions];
    if (field === "options") {
      const [optionIndex, optionValue] = value;
      updatedQuestions[index].options[optionIndex] = optionValue;
    } else {
      (updatedQuestions[index] as any)[field] = value;
    }
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    setIsLoading(true);

    try {
      await musicEducationApi.updateQuiz(quiz.id, {
        ...formData,
        lesson_id: lesson.id,
      });

      toast.success("Quiz updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update quiz:", error);
      toast.error("Failed to update quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Quiz</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter quiz description"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                min={1}
                value={formData.time_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    time_limit: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min={0}
                max={100}
                value={formData.passing_score}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    passing_score: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Questions</Label>
              <Button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {formData.questions.map((question, questionIndex) => (
              <Card key={questionIndex}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>Question {questionIndex + 1}</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) =>
                          handleQuestionChange(
                            questionIndex,
                            "question",
                            e.target.value
                          )
                        }
                        placeholder="Enter your question"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveQuestion(questionIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <Label>Options</Label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-4">
                        <Input
                          type="radio"
                          className="w-4"
                          name={`correct_${questionIndex}`}
                          checked={question.correct_option === optionIndex}
                          onChange={() =>
                            handleQuestionChange(
                              questionIndex,
                              "correct_option",
                              optionIndex
                            )
                          }
                          required
                        />
                        <Input
                          className="flex-1"
                          value={option}
                          onChange={(e) =>
                            handleQuestionChange(questionIndex, "options", [
                              optionIndex,
                              e.target.value,
                            ])
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
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

