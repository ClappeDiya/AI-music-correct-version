"use client";

import { useEffect, useState } from "react";
import { Shield, Eye, EyeOff, Bell } from "lucide-react";
import { userPreferencesService } from "@/services/user-preferences";
import { useSettingsOperation } from "@/hooks/Usesettings";
import { SettingsCard } from "@/components/ui/SettingsCard";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/Separator";

interface PrivacySettings {
  data_collection: boolean;
  analytics_enabled: boolean;
  notifications_enabled: boolean;
  share_listening_history: boolean;
  personalized_recommendations: boolean;
}

export function PrivacySettings() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);

  const { execute: updatePrivacy, loading } = useSettingsOperation(
    userPreferencesService.updatePrivacySettings,
    "Privacy settings updated successfully",
    "Failed to update privacy settings",
  );

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const response = await userPreferencesService.getPrivacySettings();
      setSettings(response.data);
    } catch (error) {
      console.error("Error loading privacy settings:", error);
    }
  };

  const handleToggle = async (key: keyof PrivacySettings) => {
    if (!settings || loading) return;

    const updatedSettings = {
      ...settings,
      [key]: !settings[key],
    };

    const success = await updatePrivacy(updatedSettings);
    if (success) {
      setSettings(updatedSettings);
    }
  };

  if (!settings) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  const privacyOptions = [
    {
      key: "data_collection" as const,
      label: "Data Collection",
      description: "Allow collection of usage data to improve your experience",
      icon: Shield,
    },
    {
      key: "analytics_enabled" as const,
      label: "Analytics",
      description: "Enable analytics to help us understand how you use the app",
      icon: Eye,
    },
    {
      key: "notifications_enabled" as const,
      label: "Notifications",
      description: "Receive notifications about important updates and events",
      icon: Bell,
    },
    {
      key: "share_listening_history" as const,
      label: "Share Listening History",
      description: "Share your listening history with other users",
      icon: Eye,
    },
    {
      key: "personalized_recommendations" as const,
      label: "Personalized Recommendations",
      description:
        "Allow AI to analyze your preferences for better recommendations",
      icon: Shield,
    },
  ];

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6">
      <SettingsCard
        title="Privacy Settings"
        description="Manage your privacy and data sharing preferences"
        className="max-w-2xl mx-auto"
      >
        <div className="space-y-6">
          {privacyOptions.map((option, index) => (
            <div key={option.key}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <option.icon className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div className="space-y-1">
                    <Label htmlFor={option.key}>{option.label}</Label>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={option.key}
                  checked={settings[option.key]}
                  onCheckedChange={() => handleToggle(option.key)}
                  disabled={loading}
                />
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>
    </ScrollArea>
  );
}
