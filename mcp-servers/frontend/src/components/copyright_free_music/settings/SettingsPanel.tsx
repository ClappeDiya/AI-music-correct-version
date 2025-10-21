import { useState } from "react";
import { useApiMutation } from "@/lib/hooks/use-api-query";
import { userSettingsApi } from "@/lib/api/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Separator } from "@/components/ui/Separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Settings, Bell, Mail, DollarSign, Globe, Save } from "lucide-react";

export function SettingsPanel() {
  const [settings, setSettings] = useState({
    notifications: {
      email_notifications: true,
      purchase_notifications: true,
      marketing_emails: false,
    },
    payment: {
      default_currency: "USD",
      auto_download: true,
    },
    display: {
      language: "en",
      theme: "system",
    },
  });

  const { update: updateSettings } = useApiMutation(
    "settings",
    userSettingsApi,
    {
      successMessage: "Settings updated successfully",
    },
  );

  const handleSave = async () => {
    await updateSettings.mutate(settings);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage how you receive notifications and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about your purchases and downloads
              </p>
            </div>
            <Switch
              checked={settings.notifications.email_notifications}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    email_notifications: checked,
                  },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Purchase Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your purchases are completed
              </p>
            </div>
            <Switch
              checked={settings.notifications.purchase_notifications}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    purchase_notifications: checked,
                  },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and promotions
              </p>
            </div>
            <Switch
              checked={settings.notifications.marketing_emails}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    marketing_emails: checked,
                  },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Settings
          </CardTitle>
          <CardDescription>
            Configure your payment and download preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Currency</Label>
            <Select
              value={settings.payment.default_currency}
              onValueChange={(value) =>
                setSettings((prev) => ({
                  ...prev,
                  payment: {
                    ...prev.payment,
                    default_currency: value,
                  },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Download</Label>
              <p className="text-sm text-muted-foreground">
                Automatically download tracks after purchase
              </p>
            </div>
            <Switch
              checked={settings.payment.auto_download}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  payment: {
                    ...prev.payment,
                    auto_download: checked,
                  },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Display Settings
          </CardTitle>
          <CardDescription>Customize your display preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={settings.display.language}
              onValueChange={(value) =>
                setSettings((prev) => ({
                  ...prev,
                  display: {
                    ...prev.display,
                    language: value,
                  },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={settings.display.theme}
              onValueChange={(value) =>
                setSettings((prev) => ({
                  ...prev,
                  display: {
                    ...prev.display,
                    theme: value,
                  },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateSettings.isLoading}
          className="w-full sm:w-auto"
        >
          {updateSettings.isLoading ? (
            "Saving..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
