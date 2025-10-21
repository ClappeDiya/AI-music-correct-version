"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/useToast";
import { useTranslation } from "next-i18next";
import { formatDistanceToNow, format } from "date-fns";
import {
  History,
  RotateCcw,
  Clock,
  User,
  Sparkles,
  Users,
  Brain,
  AlertTriangle,
} from "lucide-react";
import { userPreferencesService } from "@/services/user-preferences";
import { useSettingsOperation } from "@/hooks/Usesettings";
import { SettingsCard } from "@/components/ui/SettingsCard";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Separator } from "@/components/ui/Separator";
import { Alert } from "@/components/ui/Alert";

interface VersionHistoryItem {
  id: string;
  timestamp: string;
  change_source: string;
  previous_state: any;
  new_state: any;
  metadata: any;
  has_ephemeral: boolean;
  has_fusion: boolean;
  description: string;
  user: string;
}

export function VersionHistory() {
  const [versions, setVersions] = useState<VersionHistoryItem[]>([]);
  const [selectedVersion, setSelectedVersion] =
    useState<VersionHistoryItem | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [preserveEphemeral, setPreserveEphemeral] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  const { execute: rollback, loading } = useSettingsOperation(
    userPreferencesService.rollbackVersion,
    "Settings restored successfully",
    "Failed to restore settings",
  );

  useEffect(() => {
    loadVersionHistory();
  }, []);

  const loadVersionHistory = async () => {
    try {
      const response = await userPreferencesService.getVersionHistory();
      setVersions(response.data);
    } catch (error) {
      console.error("Error loading version history:", error);
      toast({
        title: t("Error"),
        description: t("Failed to load version history"),
        variant: "destructive",
      });
    }
  };

  const handleRollback = async () => {
    if (!selectedVersion) return;

    const success = await rollback(selectedVersion.id, {
      preserve_ephemeral: preserveEphemeral,
    });
    if (success) {
      setConfirmDialogOpen(false);
      loadVersionHistory();
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "manual":
        return <User className="h-4 w-4" />;
      case "ephemeral":
        return <Sparkles className="h-4 w-4" />;
      case "ml_driven":
        return <Brain className="h-4 w-4" />;
      case "persona_fusion":
        return <Users className="h-4 w-4" />;
      case "rollback":
        return <History className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatSource = (source: string) => {
    return source
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getPreferenceChanges = (entry: VersionHistoryItem) => {
    const changes: string[] = [];

    Object.entries(entry.new_state).forEach(([category, values]) => {
      Object.entries(values as any).forEach(([key, value]) => {
        const previous = entry.previous_state[category]?.[key];
        if (previous !== value) {
          changes.push(`${category}.${key}: ${previous} → ${value}`);
        }
      });
    });

    return changes;
  };

  if (!versions.length) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6">
      <SettingsCard
        title="Version History"
        description="View and restore previous settings configurations"
        className="max-w-4xl mx-auto"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Modified By</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((version) => (
              <TableRow key={version.id}>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(version.timestamp), "MMM d, yyyy HH:mm")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getSourceIcon(version.change_source)}
                    <span>{formatSource(version.change_source)}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {getPreferenceChanges(version).map((change, index) => (
                      <div key={index} className="text-sm">
                        • {change}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{version.user}</TableCell>
                <TableCell>
                  <Dialog
                    open={confirmDialogOpen}
                    onOpenChange={setConfirmDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVersion(version)}
                        disabled={loading}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {t("Restore")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("Confirm Restore")}</DialogTitle>
                        <DialogDescription>
                          {t(
                            "Are you sure you want to restore settings to this version?",
                          )}
                          {t("This will override your current settings.")}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedVersion && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>{t("Version Details")}</Label>
                              <Badge variant="outline">
                                {format(
                                  new Date(selectedVersion.timestamp),
                                  "PPpp",
                                )}
                              </Badge>
                            </div>
                            <Alert>
                              <AlertTitle className="flex items-center space-x-2">
                                {getSourceIcon(selectedVersion.change_source)}
                                <span>
                                  {formatSource(selectedVersion.change_source)}
                                </span>
                              </AlertTitle>
                              <AlertDescription>
                                <div className="mt-2 space-y-1">
                                  {getPreferenceChanges(selectedVersion).map(
                                    (change, index) => (
                                      <div key={index} className="text-sm">
                                        • {change}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </AlertDescription>
                            </Alert>
                          </div>

                          <Separator />

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label>{t("Preserve Ephemeral Settings")}</Label>
                              <p className="text-sm text-muted-foreground">
                                {t("Keep current ephemeral session settings")}
                              </p>
                            </div>
                            <Switch
                              checked={preserveEphemeral}
                              onCheckedChange={setPreserveEphemeral}
                            />
                          </div>

                          {selectedVersion.has_fusion && (
                            <Alert variant="warning">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>
                                {t("Persona Fusion Warning")}
                              </AlertTitle>
                              <AlertDescription>
                                {t(
                                  "This version contains persona fusion settings. Restoring may affect current persona states.",
                                )}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setConfirmDialogOpen(false)}
                        >
                          {t("Cancel")}
                        </Button>
                        <Button onClick={handleRollback} disabled={loading}>
                          {loading ? t("Restoring...") : t("Confirm Restore")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SettingsCard>
    </ScrollArea>
  );
}
