"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { toast } from "@/components/ui/usetoast";
import { UserSettings } from "@/lib/types";

interface PreferencesFormValues {
  theme: string;
  notifications: boolean;
  language: string;
  timezone: string;
}

export default function PreferencesForm() {
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserSettings | null>(null);

  const { control, handleSubmit, reset } = useForm<PreferencesFormValues>({
    defaultValues: {
      theme: "light",
      notifications: true,
      language: "en",
      timezone: "UTC",
    },
  });

  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch("/api/settings/preferences");
        const data = await response.json();
        setPreferences(data);
        reset(data.preferences);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch preferences",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, [reset]);

  async function onSubmit(values: PreferencesFormValues) {
    try {
      const response = await fetch("/api/settings/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Preferences updated successfully",
        });
      } else {
        throw new Error("Failed to update preferences");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Controller
        control={control}
        name="theme"
        render={({ field }) => (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Theme</label>
            <Input {...field} />
          </div>
        )}
      />

      <Controller
        control={control}
        name="notifications"
        render={({ field }) => (
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Notifications</label>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      <Button type="submit">Save preferences</Button>
    </form>
  );
}
