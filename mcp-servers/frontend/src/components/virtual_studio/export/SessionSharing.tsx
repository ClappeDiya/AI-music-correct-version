"use client";

import { useState, useEffect } from "react";
import {
  Share2,
  History,
  Users,
  Link,
  Globe,
  Lock,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/useToast";
import { virtualStudioApi } from "@/services/virtual_studio/api";
import type { ExportedFile } from "@/types/virtual_studio";

interface SessionSharingProps {
  sessionId: string;
  exportedFiles: ExportedFile[];
}

interface ShareSettings {
  isPublic: boolean;
  allowCollaboration: boolean;
  sharedWith: Array<{
    email: string;
    permission: "view" | "edit";
  }>;
}

export function SessionSharing({
  sessionId,
  exportedFiles,
}: SessionSharingProps) {
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isPublic: false,
    allowCollaboration: false,
    sharedWith: [],
  });
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPermission, setNewPermission] = useState<"view" | "edit">("view");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadShareSettings();
  }, [sessionId]);

  const loadShareSettings = async () => {
    try {
      const settings = await virtualStudioApi.getSessionSharing(sessionId);
      setShareSettings(settings);
      if (settings.isPublic) {
        setShareLink(
          `${window.location.origin}/virtual_studio/session/${sessionId}`,
        );
      }
    } catch (error) {
      console.error("Error loading share settings:", error);
    }
  };

  const handleShareSettingChange = async (
    setting: keyof ShareSettings,
    value: boolean,
  ) => {
    try {
      await virtualStudioApi.updateSessionSharing(sessionId, {
        ...shareSettings,
        [setting]: value,
      });
      setShareSettings((prev) => ({ ...prev, [setting]: value }));

      if (setting === "isPublic") {
        setShareLink(
          value
            ? `${window.location.origin}/virtual_studio/session/${sessionId}`
            : "",
        );
      }

      toast({
        title: "Settings Updated",
        description: `Session sharing settings have been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sharing settings.",
        variant: "destructive",
      });
    }
  };

  const handleAddShare = async () => {
    if (!newEmail) return;

    try {
      await virtualStudioApi.addSessionShare(sessionId, {
        email: newEmail,
        permission: newPermission,
      });

      setShareSettings((prev) => ({
        ...prev,
        sharedWith: [
          ...prev.sharedWith,
          { email: newEmail, permission: newPermission },
        ],
      }));

      setNewEmail("");
      toast({
        title: "Share Added",
        description: `Session has been shared with ${newEmail}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share session.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveShare = async (email: string) => {
    try {
      await virtualStudioApi.removeSessionShare(sessionId, email);
      setShareSettings((prev) => ({
        ...prev,
        sharedWith: prev.sharedWith.filter((share) => share.email !== email),
      }));

      toast({
        title: "Share Removed",
        description: `Access removed for ${email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove share.",
        variant: "destructive",
      });
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied",
        description: "Share link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Session Sharing
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareDialog(true)}
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Access
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <Label>Public Access</Label>
          </div>
          <Switch
            checked={shareSettings.isPublic}
            onCheckedChange={(checked) =>
              handleShareSettingChange("isPublic", checked)
            }
          />
        </div>

        {shareSettings.isPublic && (
          <div className="flex items-center space-x-2">
            <Input value={shareLink} readOnly className="flex-1" />
            <Button variant="outline" size="icon" onClick={copyShareLink}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <Label>Allow Collaboration</Label>
          </div>
          <Switch
            checked={shareSettings.allowCollaboration}
            onCheckedChange={(checked) =>
              handleShareSettingChange("allowCollaboration", checked)
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Version History</Label>
          <div className="space-y-2">
            {exportedFiles.map((file, index) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 rounded-lg border"
              >
                <div className="flex items-center space-x-2">
                  <History className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">
                      Version {exportedFiles.length - index}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(file.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1 space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="w-32 space-y-2">
                <Label>Permission</Label>
                <Select
                  value={newPermission}
                  onValueChange={(value: "view" | "edit") =>
                    setNewPermission(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddShare}>Share</Button>
            </div>

            <div className="space-y-2">
              <Label>Shared With</Label>
              {shareSettings.sharedWith.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  This session hasn't been shared with anyone yet
                </p>
              ) : (
                <div className="space-y-2">
                  {shareSettings.sharedWith.map((share) => (
                    <div
                      key={share.email}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div>
                        <p className="text-sm font-medium">{share.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {share.permission}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveShare(share.email)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
