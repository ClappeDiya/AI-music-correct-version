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
import { Switch } from "@/components/ui/Switch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { toast } from "sonner";
import { useSettingsStore } from "@/stores/settings-store";
import { SettingsForm } from "@/components/settings/SettingsForm";
import {
  notificationSettingsSchema,
  type NotificationSettingsForm,
} from "@/lib/schemas/settings";
import { TimeInput } from "@/components/ui/timeinput";

export function NotificationSettings() {
  const { setNotificationSettings, unsavedChanges } = useSettingsStore();

  const form = useForm<NotificationSettingsForm>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: unsavedChanges.notifications || {
      email: {
        updates: true,
        security: true,
        marketing: false,
      },
      push: {
        enabled: true,
        quiet_hours: {
          enabled: false,
          start: "22:00",
          end: "07:00",
        },
      },
    },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["notification-settings"],
    queryFn: settingsService.getNotificationSettings,
    onSuccess: (data) => {
      setNotificationSettings(data);
      if (!unsavedChanges.notifications) {
        form.reset(data);
      }
    },
  });

  const mutation = useMutation({
    mutationFn: settingsService.updateNotificationSettings,
    onSuccess: () => {
      toast.success("Notification settings updated successfully");
      useSettingsStore.getState().clearUnsavedChanges("notifications");
    },
    onError: () => {
      toast.error("Failed to update notification settings");
    },
  });

  return (
    <SettingsForm
      title="Notification Settings"
      description="Manage how and when you receive notifications"
      form={form}
      onSubmit={mutation.mutate}
      isLoading={isLoading}
      isPending={mutation.isPending}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Email Notifications</h3>

          <FormField
            control={form.control}
            name="email.updates"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Product Updates</FormLabel>
                  <FormDescription>
                    Receive emails about new features and improvements
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

          {/* Add other email notification settings */}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Push Notifications</h3>

          <FormField
            control={form.control}
            name="push.enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Enable Push Notifications
                  </FormLabel>
                  <FormDescription>
                    Receive real-time notifications on your device
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

          <FormField
            control={form.control}
            name="push.quiet_hours.enabled"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Quiet Hours</FormLabel>
                    <FormDescription>
                      Mute notifications during specific hours
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>

                {field.value && (
                  <div className="grid grid-cols-2 gap-4 pl-4">
                    <FormField
                      control={form.control}
                      name="push.quiet_hours.start"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <TimeInput {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="push.quiet_hours.end"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <TimeInput {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>
      </div>
    </SettingsForm>
  );
}
