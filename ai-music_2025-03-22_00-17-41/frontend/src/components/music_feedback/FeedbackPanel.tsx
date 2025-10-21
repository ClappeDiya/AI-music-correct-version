import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Slider } from "@/components/ui/Slider";
import { useToast } from "@/components/ui/useToast";
import { cn } from "@/lib/utils";

interface FeedbackPanelProps {
  trackId: string;
  onFeedbackSubmitted?: () => void;
  className?: string;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  trackId,
  onFeedbackSubmitted,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rating, setRating] = useState(3);
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();

  const handleSubmitFeedback = async (type: "like" | "dislike" | "tweak") => {
    try {
      const response = await fetch("/api/music/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackId,
          type,
          rating,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast({
        title: "Thank you!",
        description: "Your feedback helps improve the music generation.",
      });

      setFeedback("");
      setRating(3);
      setIsExpanded(false);
      onFeedbackSubmitted?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto p-4", className)}>
      <AnimatePresence>
        <motion.div
          initial={{ height: "auto" }}
          animate={{ height: isExpanded ? "auto" : "60px" }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-lg shadow-lg overflow-hidden"
        >
          <div className="flex flex-col gap-4 p-4">
            {/* Quick Feedback Buttons */}
            <div className="flex justify-center gap-2 md:gap-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 max-w-[150px]"
                onClick={() => handleSubmitFeedback("like")}
              >
                👍 Like
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 max-w-[150px]"
                onClick={() => handleSubmitFeedback("dislike")}
              >
                👎 Dislike
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 max-w-[150px]"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                ✏️ Tweak
              </Button>
            </div>

            {/* Expanded Feedback Form */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Rating Slider */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Rating: {rating}/5
                  </label>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[rating]}
                    onValueChange={([value]) => setRating(value)}
                    className="w-full"
                  />
                </div>

                {/* Feedback Text */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    What would you like to change?
                  </label>
                  <Textarea
                    placeholder="e.g., Make it faster, add more bass, make it more complex..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full min-h-[100px]"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  className="w-full md:w-auto"
                  onClick={() => handleSubmitFeedback("tweak")}
                  disabled={!feedback.trim()}
                >
                  Submit Tweak Request
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
