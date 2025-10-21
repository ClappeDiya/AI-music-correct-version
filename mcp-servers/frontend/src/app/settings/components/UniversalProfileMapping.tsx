"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/usetoast";
import {
  Loader2,
  Globe2,
  Link2,
  Unlink,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  settingsService,
  UniversalProfileMapping,
} from "@/services/settings.service";

interface ExternalProfile {
  id: string;
  platform: string;
  status: "active" | "pending" | "error";
  lastSync: string;
}

export function UniversalProfileMapping() {
  const [mappings, setMappings] = useState<UniversalProfileMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = async () => {
    try {
      const data = await settingsService.getUniversalProfileMappings();
      setMappings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile mappings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (mappingId: number) => {
    try {
      await settingsService.syncProfileMapping(mappingId);
      toast({
        title: "Success",
        description: "Profile sync initiated",
      });
      loadMappings(); // Reload to get updated status
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync profile",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (mappingId: number) => {
    try {
      await settingsService.disconnectProfileMapping(mappingId);
      setMappings((prev) => prev.filter((mapping) => mapping.id !== mappingId));
      toast({
        title: "Success",
        description: "Profile disconnected successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect profile",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "success", icon: CheckCircle2 },
      pending: { variant: "warning", icon: RefreshCw },
      error: { variant: "destructive", icon: XCircle },
    };
    const { variant, icon: Icon } = variants[status as keyof typeof variants];

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        <span className="capitalize">{status}</span>
      </Badge>
    );
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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Universal Profile Mappings</h2>
        <Button>
          <Link2 className="h-4 w-4 mr-2" />
          Connect New Profile
        </Button>
      </div>

      <div className="grid gap-6">
        {mappings.map((mapping) => (
          <Card key={mapping.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe2 className="h-5 w-5" />
                  <span>{mapping.platform_name}</span>
                </div>
                {getStatusBadge(mapping.sync_status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Profile ID</Label>
                  <Input
                    value={mapping.external_profile_id}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Synced</Label>
                  <Input
                    value={new Date(mapping.last_sync).toLocaleString()}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sync Settings</Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(mapping.sync_settings).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm capitalize">
                        {key.replace("_", " ")}
                      </span>
                      <Switch
                        checked={value as boolean}
                        onCheckedChange={(checked) => {
                          // Handle sync setting change
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSync(mapping.id)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDisconnect(mapping.id)}
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mappings.length === 0 && (
        <Card className="p-8 flex flex-col items-center justify-center text-center">
          <Globe2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Profiles Connected</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect external profiles to sync your preferences across platforms
          </p>
          <Button>
            <Link2 className="h-4 w-4 mr-2" />
            Connect Your First Profile
          </Button>
        </Card>
      )}
    </div>
  );
}
