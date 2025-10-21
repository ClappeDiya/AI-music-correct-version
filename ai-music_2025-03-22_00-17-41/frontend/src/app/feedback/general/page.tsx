"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/useToast";
import { MessageSquare, Send, ThumbsUp, ThumbsDown } from "lucide-react";

// Define the form schema using zod
const formSchema = z.object({
  category: z.enum([
    "general", 
    "usability", 
    "performance", 
    "audio_quality", 
    "interface", 
    "other"
  ], {
    required_error: "Please select a category for your feedback.",
  }),
  satisfaction: z.enum(["very_satisfied", "satisfied", "neutral", "dissatisfied", "very_dissatisfied"], {
    required_error: "Please indicate your satisfaction level.",
  }),
  feedback: z.string().min(10, {
    message: "Your feedback must be at least 10 characters.",
  }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  anonymous: z.boolean().default(false),
});

type FeedbackFormValues = z.infer<typeof formSchema>;

export default function GeneralFeedbackPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Default values for the form
  const defaultValues: Partial<FeedbackFormValues> = {
    category: undefined,
    satisfaction: undefined,
    feedback: "",
    email: "",
    anonymous: false,
  };

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(data: FeedbackFormValues) {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Feedback submitted:", data);
      
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! We value your input.",
      });
      
      form.reset(defaultValues);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-2xl mx-auto pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">General Feedback</h1>
        <p className="text-muted-foreground mt-1">
          Share your thoughts to help us improve your music experience
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
            Submit Your Feedback
          </CardTitle>
          <CardDescription>
            Tell us what you think about our platform. Your input helps us make improvements.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="usability">Usability</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="audio_quality">Audio Quality</SelectItem>
                        <SelectItem value="interface">User Interface</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the category that best describes your feedback
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="satisfaction"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>How satisfied are you with our platform?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="very_satisfied" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                            Very Satisfied
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="satisfied" />
                          </FormControl>
                          <FormLabel className="font-normal">Satisfied</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="neutral" />
                          </FormControl>
                          <FormLabel className="font-normal">Neutral</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="dissatisfied" />
                          </FormControl>
                          <FormLabel className="font-normal">Dissatisfied</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="very_dissatisfied" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center">
                            <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
                            Very Dissatisfied
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
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
                        placeholder="Please share your thoughts, suggestions, or concerns about our platform..."
                        className="min-h-[150px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Be as specific as possible to help us understand your experience better
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide your email if you'd like us to follow up with you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Submit Anonymously</FormLabel>
                      <FormDescription>
                        Check this to submit your feedback without associating it with your account
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
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
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 