"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { FeatureRequest } from "@/services/featureRequestService";

const featureRequestSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }).max(200, {
    message: "Title must not exceed 200 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }).max(2000, {
    message: "Description must not exceed 2000 characters.",
  }),
  category: z.enum(["vr", "collaboration", "ai", "interface", "audio", "other"], {
    required_error: "Please select a category.",
  }),
  priority: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select a priority.",
  }),
});

type FeatureRequestFormValues = z.infer<typeof featureRequestSchema>;

interface FeatureRequestFormProps {
  onSubmit: (data: Omit<FeatureRequest, "id" | "votes_count" | "has_voted" | "user" | "submitted_by_name" | "created_at" | "updated_at">) => Promise<void>;
  onCancel: () => void;
}

export function FeatureRequestForm({ onSubmit, onCancel }: FeatureRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FeatureRequestFormValues>({
    resolver: zodResolver(featureRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "other",
      priority: "medium",
    },
  });

  const handleSubmit = async (values: FeatureRequestFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        title: values.title,
        description: values.description,
        category: values.category,
        priority: values.priority,
        status: "pending", // Default status for new requests
      });
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter the title of your feature request" {...field} />
              </FormControl>
              <FormDescription>
                Provide a clear and concise title for your feature request.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="vr">Virtual Reality</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                    <SelectItem value="ai">AI Tools</SelectItem>
                    <SelectItem value="interface">User Interface</SelectItem>
                    <SelectItem value="audio">Audio Processing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the category that best fits your feature request.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Indicate how important this feature is to you.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the feature you'd like to see and why it would be valuable"
                  className="min-h-[150px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide details about how the feature should work and what problem it solves.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" onClick={form.handleSubmit(handleSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feature Request"}
          </Button>
        </div>
      </div>
    </Form>
  );
} 