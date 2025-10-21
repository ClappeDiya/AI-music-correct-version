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
import { useToast } from "@/components/ui/usetoast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/componen../ui/card";
import { Upload } from "lucide-react";

const submissionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  audioFile: z
    .any()
    .refine((file) => file instanceof File, "Audio file is required"),
});

interface SubmissionFormProps {
  challengeId: string;
  onSubmissionComplete: () => void;
}

export function SubmissionForm({
  challengeId,
  onSubmissionComplete,
}: SubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof submissionSchema>>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof submissionSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("audioFile", values.audioFile);
      formData.append("challengeId", challengeId);

      const response = await fetch("/api/challenges/submissions", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to submit entry");

      toast({
        title: "Success",
        description: "Your submission has been uploaded successfully.",
      });

      form.reset();
      onSubmissionComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Submit Your Entry</CardTitle>
        <CardDescription>
          Share your musical creation for this challenge
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Tell us about your creative process and inspiration
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="audioFile"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Audio File</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onChange(file);
                        }}
                        {...field}
                      />
                      <Upload className="h-4 w-4 opacity-70" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload your audio file (MP3, WAV formats accepted)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Submit Entry"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
