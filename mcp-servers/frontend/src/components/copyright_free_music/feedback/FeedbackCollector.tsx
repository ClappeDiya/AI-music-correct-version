import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/useToast";
import { StarRating } from "@/components/ui/star-rating";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";

const feedbackSchema = z.object({
  category: z.enum(["licensing", "pricing", "features", "usability", "other"]),
  rating: z.number().min(1).max(5),
  feedback: z.string().min(10, "Please provide more detailed feedback"),
  willRecommend: z.boolean(),
});

type FeedbackData = z.infer<typeof feedbackSchema>;

interface FeedbackCollectorProps {
  onFeedbackSubmit?: (feedback: FeedbackData) => Promise<void>;
  context?: "licensing" | "pricing" | "features";
}

export function FeedbackCollector({
  onFeedbackSubmit,
  context,
}: FeedbackCollectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<FeedbackData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: context || "licensing",
      rating: 0,
      feedback: "",
      willRecommend: false,
    },
  });

  const onSubmit = async (data: FeedbackData) => {
    try {
      await onFeedbackSubmit?.(data);
      toast({
        title: "Thank you for your feedback!",
        description: "Your input helps us improve our platform.",
      });
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" />
          Give Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve our platform by sharing your thoughts and
            experiences.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="licensing">
                        Licensing Process
                      </SelectItem>
                      <SelectItem value="pricing">Pricing Model</SelectItem>
                      <SelectItem value="features">
                        Platform Features
                      </SelectItem>
                      <SelectItem value="usability">Usability</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Rating</FormLabel>
                  <FormControl>
                    <StarRating
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts and suggestions..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please be specific and provide examples if possible.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="willRecommend"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Would you recommend our platform?</FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={field.value ? "default" : "outline"}
                        onClick={() => field.onChange(true)}
                      >
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Yes
                      </Button>
                      <Button
                        type="button"
                        variant={!field.value ? "default" : "outline"}
                        onClick={() => field.onChange(false)}
                      >
                        <ThumbsDown className="mr-2 h-4 w-4" />
                        No
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Submit Feedback</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
