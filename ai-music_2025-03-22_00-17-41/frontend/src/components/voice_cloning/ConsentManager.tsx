"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { useToast } from "@/components/ui/useToast";
import {
  ConsentSettings,
  ConsentManagementService,
} from "@/lib/api/services/consent-management";
import { Shield, AlertTriangle, Trash2 } from "lucide-react";

interface ConsentManagerProps {
  voiceId: number;
  onConsentChange: (hasConsent: boolean) => void;
  onDataDeleted: () => void;
}

export function ConsentManager({
  voiceId,
  onConsentChange,
  onDataDeleted,
}: ConsentManagerProps) {
  const [settings, setSettings] = useState<ConsentSettings | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConsentSettings();
  }, [voiceId]);

  const loadConsentSettings = async () => {
    try {
      const data = await ConsentManagementService.getConsentSettings(voiceId);
      setSettings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load consent settings",
        variant: "destructive",
      });
    }
  };

  const handleConsentChange = async (
    key: keyof ConsentSettings,
    value: boolean,
  ) => {
    if (!settings) return;

    try {
      const updated = await ConsentManagementService.updateConsentSettings(
        voiceId,
        {
          [key]: value,
        },
      );
      setSettings(updated);
      onConsentChange(updated.usage_consent);

      toast({
        title: "Settings Updated",
        description: "Your consent settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update consent settings",
        variant: "destructive",
      });
    }
  };

  const handleRevokeConsent = async () => {
    try {
      await ConsentManagementService.revokeConsent(voiceId);
      await loadConsentSettings();
      setRevokeDialogOpen(false);
      onConsentChange(false);

      toast({
        title: "Consent Revoked",
        description: "Your consent has been revoked successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke consent",
        variant: "destructive",
      });
    }
  };

  const handleDeleteData = async () => {
    try {
      await ConsentManagementService.deleteVoiceData(voiceId);
      setDeleteDialogOpen(false);
      onDataDeleted();

      toast({
        title: "Data Deleted",
        description: "Your voice data has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete voice data",
        variant: "destructive",
      });
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Consent & Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Usage Consent</label>
                <p className="text-sm text-muted-foreground">
                  Allow your voice model to be used for generating speech
                </p>
              </div>
              <Switch
                checked={settings.usage_consent}
                onCheckedChange={(value) =>
                  handleConsentChange("usage_consent", value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Data Retention</label>
                <p className="text-sm text-muted-foreground">
                  Keep your voice samples and model data stored
                </p>
              </div>
              <Switch
                checked={settings.data_retention}
                onCheckedChange={(value) =>
                  handleConsentChange("data_retention", value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Third-Party Usage</label>
                <p className="text-sm text-muted-foreground">
                  Allow your voice model to be used by third-party services
                </p>
              </div>
              <Switch
                checked={settings.third_party_usage}
                onCheckedChange={(value) =>
                  handleConsentChange("third_party_usage", value)
                }
              />
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Notice</AlertTitle>
            <AlertDescription>
              Your voice data is protected under applicable privacy laws. You
              can revoke consent or delete your data at any time.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setRevokeDialogOpen(true)}>
            Revoke All Consent
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Voice Data
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Consent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke all consent? This will prevent
              your voice model from being used for any purpose until consent is
              granted again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeConsent}
              className="bg-destructive text-destructive-foreground"
            >
              Revoke Consent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voice Data</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all your voice data? This action
              cannot be undone and will permanently remove all your voice
              samples and models.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteData}
              className="bg-destructive text-destructive-foreground"
            >
              Delete Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
