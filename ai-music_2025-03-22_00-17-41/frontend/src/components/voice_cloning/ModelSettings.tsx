"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/useToast";
import { VoiceModel, voiceCloning } from "@/services/api/voice_cloning";
import { Shield, Key, Save } from "lucide-react";

interface ModelSettingsProps {
  model: VoiceModel;
  onUpdate: (model: VoiceModel) => void;
}

export function ModelSettings({ model, onUpdate }: ModelSettingsProps) {
  const [name, setName] = useState(model.name);
  const [isEncrypted, setIsEncrypted] = useState(model.is_encrypted);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await voiceCloning.updateVoiceModel(model.id, {
        name,
        is_encrypted: isEncrypted,
      });
      onUpdate(response.data);
      toast({
        title: "Settings Saved",
        description: "Model settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update model settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Model Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Encryption</Label>
              <p className="text-sm text-muted-foreground">
                Enable at-rest encryption for this voice model
              </p>
            </div>
            <Switch checked={isEncrypted} onCheckedChange={setIsEncrypted} />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <>Saving...</>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
}
