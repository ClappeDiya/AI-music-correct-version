"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/usetoast";
import {
  VoiceModelPermission,
  voiceCloning,
} from "@/services/api/voice_cloning";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface Props {
  modelId: number;
  permissions: VoiceModelPermission[];
  onUpdate: () => void;
}

export function PermissionManager({ modelId, permissions, onUpdate }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handlePermissionToggle = async (permission: VoiceModelPermission) => {
    try {
      setIsUpdating(true);
      await voiceCloning.updatePermission(permission.id, {
        consent_revoked_at: permission.consent_granted_at
          ? new Date().toISOString()
          : null,
        consent_granted_at: permission.consent_granted_at
          ? null
          : new Date().toISOString(),
      });
      onUpdate();
      toast({
        title: "Success",
        description: "Permission updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {permissions.map((permission) => (
        <Card key={permission.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {permission.consent_granted_at ? (
                <ShieldCheck className="h-5 w-5 text-green-500" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-red-500" />
              )}
              {permission.user.username}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Status: {permission.consent_granted_at ? "Active" : "Revoked"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last updated:{" "}
                  {new Date(
                    permission.consent_revoked_at ||
                      permission.consent_granted_at ||
                      "",
                  ).toLocaleDateString()}
                </p>
              </div>
              <Switch
                checked={!!permission.consent_granted_at}
                onCheckedChange={() => handlePermissionToggle(permission)}
                disabled={isUpdating}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
