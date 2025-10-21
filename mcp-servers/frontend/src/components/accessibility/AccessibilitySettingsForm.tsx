import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/usetoast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const formSchema = z.object({
  textSize: z.string().min(1, "Text size is required"),
  colorContrast: z.string().min(1, "Color contrast is required"),
  screenReaderSupport: z.boolean().optional(),
  locale: z.string().min(1, "Locale is required"),
  userId: z.string().min(1, "User ID is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AccessibilitySettingsFormProps {
  initialData?: {
    id: string;
    textSize: string;
    colorContrast: string;
    screenReaderSupport: boolean;
    locale: string;
  };
  onSuccess?: () => void;
}

export function AccessibilitySettingsForm({
  initialData,
  onSuccess,
}: AccessibilitySettingsFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textSize: initialData?.textSize || "medium",
      colorContrast: initialData?.colorContrast || "normal",
      screenReaderSupport: initialData?.screenReaderSupport || false,
      locale: initialData?.locale || "en",
      userId,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (initialData) {
        await api.accessibility.updateSettings.mutate({
          id: initialData.id,
          ...values,
        });
      } else {
        await api.accessibility.createSettings.mutate(values);
      }

      toast({
        title: "Success",
        description: "Accessibility settings saved successfully",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save accessibility settings",
        variant: "destructive",
      });
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="textSize">
          {(field) => (
            <FormItem>
              <FormLabel>Text Size</FormLabel>
              <FormControl>
                <Input {...field} value={field.value as string} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </FormField>

        <FormField name="colorContrast">
          {(field) => (
            <FormItem>
              <FormLabel>Color Contrast</FormLabel>
              <FormControl>
                <Input {...field} value={field.value as string} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </FormField>

        <FormField name="screenReaderSupport">
          {(field) => (
            <FormItem>
              <FormLabel>Screen Reader Support</FormLabel>
              <FormControl>
                <Input
                  type="checkbox"
                  checked={field.value as boolean}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </FormField>

        <FormField name="locale">
          {(field) => (
            <FormItem>
              <FormLabel>Locale</FormLabel>
              <FormControl>
                <Input {...field} value={field.value as string} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </FormField>

        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
