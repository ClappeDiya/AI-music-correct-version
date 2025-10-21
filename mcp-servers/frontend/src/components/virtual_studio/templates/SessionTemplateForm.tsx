import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, Template, Music } from "lucide-react";
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
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import type { SessionTemplate } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

const templateFormSchema = z.object({
  template_name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  is_public: z.boolean().default(false),
  default_tracks: z.number().min(1).max(32).default(8),
});

interface SessionTemplateFormProps {
  initialData?: SessionTemplate;
  onSubmit: (data: SessionTemplate) => void;
  onCancel: () => void;
}

export function SessionTemplateForm({
  initialData,
  onSubmit,
  onCancel,
}: SessionTemplateFormProps) {
  const form = useForm<z.infer<typeof templateFormSchema>>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      template_name: initialData?.template_name || "",
      description: initialData?.template_data?.description || "",
      is_public: initialData?.is_public || false,
      default_tracks: initialData?.template_data?.default_tracks || 8,
    },
  });

  const handleSubmit = async (values: z.infer<typeof templateFormSchema>) => {
    const templateData = {
      ...values,
      template_data: {
        description: values.description,
        default_tracks: values.default_tracks,
        created_at: new Date().toISOString(),
      },
    };

    try {
      const result = await virtualStudioApi.createSessionTemplate(templateData);
      onSubmit(result);
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Template className="h-5 w-5" />
          {initialData ? "Edit Session Template" : "Create Session Template"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="template_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter template name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your template a descriptive name
                  </FormDescription>
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
                    <Textarea
                      placeholder="Describe your template..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add details about the template's purpose and configuration
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="default_tracks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Number of Tracks</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of tracks" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[4, 8, 16, 24, 32].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Tracks
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the default number of tracks for this template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public Template</FormLabel>
                    <FormDescription>
                      Make this template available to other users
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {initialData ? "Update Template" : "Save Template"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
