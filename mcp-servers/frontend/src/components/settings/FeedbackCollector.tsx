import { useState } from "react";
import { useToast } from "@/components/ui/useToast";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/Label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Sparkles,
  Users,
  Star,
} from "lucide-react";
import { useTranslation } from "next-i18next";

interface FeedbackItem {
  feature: string;
  rating: number;
  comment: string;
}

export function FeedbackCollector() {
  const [feedback, setFeedback] = useState<FeedbackItem>({
    feature: "ml_suggestions",
    rating: 0,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const features = [
    {
      id: "ml_suggestions",
      label: t("ML Suggestions"),
      description: t("AI-powered preference predictions"),
      icon: <Brain className="h-4 w-4" />,
    },
    {
      id: "ephemeral_overlays",
      label: t("Ephemeral Overlays"),
      description: t("Temporary preference modifications"),
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: "persona_fusion",
      label: t("Persona Fusion"),
      description: t("Combining multiple preference sets"),
      icon: <Users className="h-4 w-4" />,
    },
  ];

  const handleSubmit = async () => {
    if (!feedback.rating || !feedback.comment.trim()) {
      toast({
        title: t("Incomplete Feedback"),
        description: t("Please provide both a rating and comment"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/settings/feedback/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      toast({
        title: t("Thank You!"),
        description: t("Your feedback has been recorded"),
      });

      // Reset form
      setFeedback({
        feature: "ml_suggestions",
        rating: 0,
        comment: "",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: t("Submission Failed"),
        description: t("Failed to submit feedback. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <div>
            <CardTitle>{t("Feature Feedback")}</CardTitle>
            <CardDescription>
              {t("Help us improve by sharing your experience")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <Label>{t("Select Feature")}</Label>
            <RadioGroup
              value={feedback.feature}
              onValueChange={(value) =>
                setFeedback({ ...feedback, feature: value })
              }
              className="grid gap-4 md:grid-cols-3"
            >
              {features.map((feature) => (
                <Label
                  key={feature.id}
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary ${
                    feedback.feature === feature.id ? "border-primary" : ""
                  }`}
                >
                  <RadioGroupItem
                    value={feature.id}
                    id={feature.id}
                    className="sr-only"
                  />
                  {feature.icon}
                  <div className="space-y-1 text-center mt-3">
                    <p className="text-sm font-medium leading-none">
                      {feature.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>{t("Your Rating")}</Label>
            <RadioGroup
              value={feedback.rating.toString()}
              onValueChange={(value) =>
                setFeedback({ ...feedback, rating: parseInt(value) })
              }
              className="flex space-x-4"
            >
              {[1, 2, 3, 4, 5].map((rating) => (
                <Label
                  key={rating}
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary ${
                    feedback.rating === rating ? "border-primary" : ""
                  }`}
                >
                  <RadioGroupItem
                    value={rating.toString()}
                    id={`rating-${rating}`}
                    className="sr-only"
                  />
                  <Star
                    className={`h-6 w-6 ${
                      rating <= feedback.rating ? "fill-primary" : ""
                    }`}
                  />
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>{t("Your Comments")}</Label>
            <Textarea
              placeholder={t("Share your thoughts and suggestions...")}
              value={feedback.comment}
              onChange={(e) =>
                setFeedback({ ...feedback, comment: e.target.value })
              }
              className="min-h-[100px]"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? t("Submitting...") : t("Submit Feedback")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
