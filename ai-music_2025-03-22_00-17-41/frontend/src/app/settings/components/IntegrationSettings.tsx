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
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { toast } from "sonner";
import { useSettingsStore } from "@/stores/settings-store";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Card, CardContent } from "@/componen../ui/card";
import { Badge } from "@/components/ui/Badge";
import { Plug2, RefreshCw, Link2, Unlink } from "lucide-react";
import * as z from "zod";

// Define schema for integration settings
const integrationSchema = z.object({
  preferenceExternalization: z.object({
    enabled: z.boolean(),
    endpoint_url: z.string().url().optional(),
    sync_frequency: z.number().min(1).max(24),
    service_name: z.string(),
  }),
  thirdPartyServices: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      enabled: z.boolean(),
      api_key: z.string().optional(),
      webhook_url: z.string().url().optional(),
      last_synced: z.string().optional(),
    }),
  ),
});

type IntegrationSettingsForm = z.infer<typeof integrationSchema>;

export function IntegrationSettings() {
  const { setIntegrationSettings, unsavedChanges } = useSettingsStore();

  const form = useForm<IntegrationSettingsForm>({
    resolver: zodResolver(integrationSchema),
    defaultValues: unsavedChanges.integrations || {
      preferenceExternalization: {
        enabled: false,
        sync_frequency: 1,
        service_name: "",
      },
      thirdPartyServices: [],
    },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["integration-settings"],
    queryFn: settingsService.getPreferenceExternalizations,
    onSuccess: (data) => {
      setIntegrationSettings(data);
      if (!unsavedChanges.integrations) {
        form.reset(data);
      }
    },
  });

  const mutation = useMutation({
    mutationFn: settingsService.updatePreferenceExternalization,
    onSuccess: () => {
      toast.success("Integration settings updated successfully");
      useSettingsStore.getState().clearUnsavedChanges("integrations");
    },
    onError: () => {
      toast.error("Failed to update integration settings");
    },
  });

  const syncIntegration = useMutation({
    mutationFn: settingsService.syncPreferenceExternalization,
    onSuccess: () => {
      toast.success("Integration synced successfully");
    },
    onError: () => {
      toast.error("Failed to sync integration");
    },
  });

  return (
    <SettingsForm
      title="Integration Settings"
      description="Manage external service connections and API integrations"
      form={form}
      onSubmit={mutation.mutate}
      isLoading={isLoading}
      isPending={mutation.isPending}
    >
      <div className="space-y-6">
        {/* Preference Externalization Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Preference Externalization</h3>
            <Plug2 className="h-5 w-5 text-muted-foreground" />
          </div>

          <FormField
            control={form.control}
            name="preferenceExternalization.enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Enable Preference Sync
                  </FormLabel>
                  <FormDescription>
                    Synchronize preferences with external services
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

          {form.watch("preferenceExternalization.enabled") && (
            <div className="space-y-4 pl-4">
              <FormField
                control={form.control}
                name="preferenceExternalization.service_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter service name" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferenceExternalization.endpoint_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endpoint URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://api.example.com/preferences"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferenceExternalization.sync_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sync Frequency (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Third-Party Services Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Connected Services</h3>
            <Link2 className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="grid gap-4">
            {form.watch("thirdPartyServices").map((service, index) => (
              <Card key={service.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">{service.name}</h4>
                      {service.last_synced && (
                        <p className="text-sm text-muted-foreground">
                          Last synced:{" "}
                          {new Date(service.last_synced).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={service.enabled ? "default" : "secondary"}
                      >
                        {service.enabled ? "Connected" : "Disconnected"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => syncIntegration.mutate(service.id)}
                        disabled={!service.enabled || syncIntegration.isPending}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const services = [
                            ...form.watch("thirdPartyServices"),
                          ];
                          services[index].enabled = !services[index].enabled;
                          form.setValue("thirdPartyServices", services);
                        }}
                      >
                        {service.enabled ? (
                          <Unlink className="h-4 w-4" />
                        ) : (
                          <Link2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </SettingsForm>
  );
}
