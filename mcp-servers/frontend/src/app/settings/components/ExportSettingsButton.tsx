"use client";

import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/usetoast";
import { ProfileHistory } from "@/lib/types";

interface ExportSettingsButtonProps {
  profileId: string;
  historyId?: string;
  className?: string;
}

export default function ExportSettingsButton({
  profileId,
  historyId,
  className,
}: ExportSettingsButtonProps) {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const url = historyId
        ? `/api/settings/profile-history/${historyId}/export`
        : `/api/settings/profiles/${profileId}/export`;

      const response = await fetch(url);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `profile_settings_${profileId}${historyId ? `_v${historyId}` : ""}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        toast({
          title: "Success",
          description: "Settings exported successfully",
        });
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export settings",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} className={className}>
      <Download className="mr-2 h-4 w-4" />
      Export Settings
    </Button>
  );
}
