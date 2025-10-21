"use client";

import { useState } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Textarea } from "@/components/ui/Textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/useToast";

interface FeedbackData {
  reportId: string;
  rating: "positive" | "negative";
  category: "clarity" | "usability" | "completeness" | "other";
  comment: string;
}

export function FeedbackDialog({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: FeedbackData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reports/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, reportId }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping us improve our reports!",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Feedback</DialogTitle>
          <DialogDescription>
            Help us improve our reports by sharing your thoughts.
          </DialogDescription>
        </DialogHeader>

        <Form>
          <div className="grid gap-4 py-4">
            <FormField
              name="rating"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Overall Rating</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="positive" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <ThumbsUp className="h-4 w-4" />
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="negative" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <ThumbsDown className="h-4 w-4" />
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Feedback Category</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="clarity" />
                        </FormControl>
                        <FormLabel className="font-normal">Clarity</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="usability" />
                        </FormControl>
                        <FormLabel className="font-normal">Usability</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="completeness" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Completeness
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts on how we can improve..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your feedback helps us improve the reporting experience.
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              onClick={() => handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
