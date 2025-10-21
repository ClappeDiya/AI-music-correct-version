"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/usetoast";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Slider } from "@/components/ui/Slider";

export default function FeedbackControls() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(3);

  const handleLike = async () => {
    try {
      const response = await fetch("/api/recommendations/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "like",
          feedback,
          rating,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      setFeedback("");
      setRating(3);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit feedback",
      });
    }
  };

  const handleDislike = async () => {
    try {
      const response = await fetch("/api/recommendations/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "dislike",
          feedback,
          rating,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      setFeedback("");
      setRating(3);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit feedback",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="feedback">Additional Feedback</Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide additional feedback..."
        />
      </div>

      <div className="space-y-2">
        <Label>Rating (1-5)</Label>
        <Slider
          value={[rating]}
          onValueChange={(value) => setRating(value[0])}
          min={1}
          max={5}
          step={1}
        />
      </div>

      <div className="flex gap-4">
        <Button onClick={handleLike} variant="default">
          Like
        </Button>
        <Button onClick={handleDislike} variant="destructive">
          Dislike
        </Button>
      </div>
    </div>
  );
}
