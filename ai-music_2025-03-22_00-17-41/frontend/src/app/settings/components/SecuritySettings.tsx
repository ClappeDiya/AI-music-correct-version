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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { toast } from "sonner";
import { useSettingsStore } from "@/stores/settings-store";
import { SettingsForm } from "@/components/settings/SettingsForm";
import {
  securitySettingsSchema,
  type SecuritySettingsForm,
} from "@/lib/schemas/settings";
import { Button } from "@/components/ui/Button";
import { Trash2, Shield } from "lucide-react";

export function SecuritySettings() {
  const { setSecuritySettings, unsavedChanges } = useSettingsStore();

  const form = useForm<SecuritySettingsForm>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: unsavedChanges.security || {
      twoFactorEnabled: false,
      loginNotifications: true,
      trustedDevices: [],
    },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["security-settings"],
    queryFn: settingsService.getSecuritySettings,
    onSuccess: (data) => {
      setSecuritySettings(data);
      if (!unsavedChanges.security) {
        form.reset(data);
      }
    },
  });

  const mutation = useMutation({
    mutationFn: settingsService.updateSecuritySettings,
    onSuccess: () => {
      toast.success("Security settings updated successfully");
      useSettingsStore.getState().clearUnsavedChanges("security");
    },
    onError: () => {
      toast.error("Failed to update security settings");
    },
  });

  const removeTrustedDevice = useMutation({
    mutationFn: settingsService.removeTrustedDevice,
    onSuccess: () => {
      toast.success("Device removed from trusted devices");
    },
  });

  return (
    <SettingsForm
      title="Security Settings"
      description="Manage your account security and trusted devices"
      form={form}
      onSubmit={mutation.mutate}
      isLoading={isLoading}
      isPending={mutation.isPending}
    >
      <FormField
        control={form.control}
        name="twoFactorEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Two-Factor Authentication
              </FormLabel>
              <FormDescription>
                Add an extra layer of security to your account
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="loginNotifications"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Login Notifications</FormLabel>
              <FormDescription>
                Receive notifications about new sign-ins to your account
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Trusted Devices</h3>
          <Shield className="h-5 w-5 text-muted-foreground" />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device Name</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {form.watch("trustedDevices").map((device) => (
              <TableRow key={device.deviceId}>
                <TableCell>{device.deviceName}</TableCell>
                <TableCell>
                  {new Date(device.lastUsed).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTrustedDevice.mutate(device.deviceId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SettingsForm>
  );
}
