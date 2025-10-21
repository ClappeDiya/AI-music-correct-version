"use client";

import { useState } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/usetoast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radiogroup";
import { Label } from "@/components/ui/Label";

interface FeedbackData {
  type: "bug" | "feature" | "general";
  category: string;
  message: string;
  rating?: number;
}

export function UserFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    type: "general",
    category: "",
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });
      setIsOpen(false);
      setFeedback({ type: "general", category: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Give Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve your experience. Your feedback is valuable to us.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Feedback Type</Label>
            <RadioGroup
              value={feedback.type}
              onValueChange={(value: FeedbackData["type"]) =>
                setFeedback((prev) => ({ ...prev, type: value }))
              }
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="bug" id="bug" className="peer sr-only" />
                <Label
                  htmlFor="bug"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Report Bug
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="feature"
                  id="feature"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="feature"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Feature Request
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="general"
                  id="general"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="general"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  General
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Your Feedback</Label>
            <Textarea
              value={feedback.message}
              onChange={(e) =>
                setFeedback((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Share your thoughts..."
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Rate Your Experience</Label>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFeedback((prev) => ({ ...prev, rating: 1 }))}
                className={
                  feedback.rating === 1
                    ? "bg-destructive text-destructive-foreground"
                    : ""
                }
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFeedback((prev) => ({ ...prev, rating: 5 }))}
                className={
                  feedback.rating === 5
                    ? "bg-primary text-primary-foreground"
                    : ""
                }
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!feedback.message}>
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
