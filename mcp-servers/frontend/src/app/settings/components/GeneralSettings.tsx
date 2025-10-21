"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/componen../ui/card";
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { toast } from "sonner";
import { useSettingsStore } from "@/stores/settings-store";
import { Loader2 } from "lucide-react";

const generalSettingsSchema = z.object({
  appName: z.string().min(2).max(50),
  currency: z.string().min(3).max(3),
  timezone: z.string(),
  language: z.string(),
});

type GeneralSettingsForm = z.infer<typeof generalSettingsSchema>;

export function GeneralSettings() {
  const { setGeneralSettings, unsavedChanges } = useSettingsStore();

  const form = useForm<GeneralSettingsForm>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: unsavedChanges.general || {
      appName: "",
      currency: "USD",
      timezone: "UTC",
      language: "en",
    },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsService.getUserSettings,
    onSuccess: (data) => {
      setGeneralSettings(data);
      if (!unsavedChanges.general) {
        form.reset({
          appName: data.preferences.appName || "",
          currency: data.preferences.currency || "USD",
          timezone: data.preferences.timezone || "UTC",
          language: data.preferences.language || "en",
        });
      }
    },
  });

  const mutation = useMutation({
    mutationFn: (data: GeneralSettingsForm) =>
      settingsService.updateUserSettings(settings!.id, {
        preferences: {
          ...settings?.preferences,
          ...data,
        },
      }),
    onSuccess: () => {
      toast.success("Settings saved successfully");
      useSettingsStore.getState().clearUnsavedChanges("general");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  const onSubmit = (data: GeneralSettingsForm) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Configure your application-wide settings
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="appName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add other form fields similarly */}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => form.reset()}
              type="button"
            >
              Reset
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
