"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/usetoast";
import { Loader2, Share2, Link, ExternalLink } from "lucide-react";
import {
  settingsService,
  PreferenceExternalization,
} from "@/services/settings.service";
import { Badge } from "@/components/ui/Badge";

export function PreferenceExternalization() {
  const [externalizations, setExternalizations] = useState<
    PreferenceExternalization[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExternalizations();
  }, []);

  const loadExternalizations = async () => {
    try {
      const data = await settingsService.getPreferenceExternalizations();
      setExternalizations(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load preference externalizations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number, active: boolean) => {
    try {
      const updated = await settingsService.updateExternalization(id, {
        active,
      });
      setExternalizations((prev) =>
        prev.map((ext) => (ext.id === id ? { ...ext, active } : ext)),
      );
      toast({
        title: "Success",
        description: `Externalization ${active ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update externalization",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Preference Externalization</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {externalizations.map((ext) => (
              <div key={ext.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Link className="h-4 w-4" />
                      <span className="font-medium">{ext.service_name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ext.description}
                    </div>
                  </div>
                  <Switch
                    checked={ext.active}
                    onCheckedChange={(checked) => handleToggle(ext.id, checked)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>API Endpoint</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={ext.endpoint_url}
                        readOnly
                        className="bg-muted"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(ext.endpoint_url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Sync Frequency</Label>
                    <Badge>{ext.sync_frequency} minutes</Badge>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Last synced:{" "}
                  {ext.last_sync
                    ? new Date(ext.last_sync).toLocaleString()
                    : "Never"}
                </div>
              </div>
            ))}

            {externalizations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No externalizations configured
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
