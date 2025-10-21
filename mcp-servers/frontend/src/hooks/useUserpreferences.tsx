"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/Form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Slider } from "@/components/ui/Slider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { toast } from "sonner";
import { useSettingsStore } from "@/stores/settings-store";
import { SettingsForm } from "@/components/settings/SettingsForm";
import {
  userPreferencesSchema,
  type UserPreferencesForm,
} from "@/lib/schemas/settings";

export function UserPreferences() {
  const { setUserPreferences, unsavedChanges } = useSettingsStore();

  const form = useForm<UserPreferencesForm>({
    resolver: zodResolver(userPreferencesSchema),
    defaultValues: unsavedChanges.preferences || {
      theme: "system",
      sensoryProfile: {
        colorScheme: "default",
        contrastLevel: 1,
        motionReduction: false,
        soundEffects: true,
      },
      accessibility: {
        fontSize: 16,
        screenReader: false,
        keyboardNavigation: true,
      },
    },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["user-preferences"],
    queryFn: settingsService.getUserPreferences,
    onSuccess: (data) => {
      setUserPreferences(data);
      if (!unsavedChanges.preferences) {
        form.reset(data);
      }
    },
  });

  const mutation = useMutation({
    mutationFn: settingsService.updateUserPreferences,
    onSuccess: () => {
      toast.success("Preferences saved successfully");
      useSettingsStore.getState().clearUnsavedChanges("preferences");
    },
    onError: () => {
      toast.error("Failed to save preferences");
    },
  });

  return (
    <SettingsForm
      title="User Preferences"
      description="Customize your experience"
      form={form}
      onSubmit={mutation.mutate}
      isLoading={isLoading}
      isPending={mutation.isPending}
    >
      <FormField
        control={form.control}
        name="theme"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Theme</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sensoryProfile.contrastLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contrast Level</FormLabel>
            <FormControl>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[field.value]}
                onValueChange={([value]) => field.onChange(value)}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sensoryProfile.motionReduction"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Reduce Motion</FormLabel>
              <FormDescription>
                Minimize animations and transitions
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Add remaining form fields */}
    </SettingsForm>
  );
}
