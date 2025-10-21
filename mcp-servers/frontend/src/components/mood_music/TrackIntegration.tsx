import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
  DialogTrigger,
} from "@/components/ui/Dialog";
import { useTrackIntegration } from "@/hooks/UseTrackIntegration";
import { Music4, Share2, Lock, Globe2, Wand2, Mic2 } from "lucide-react";
import type { TrackIntegration } from "@/lib/api/services/track-integration";

const MODULE_ICONS = {
  studio: <Music4 className="h-4 w-4" />,
  dj: <Wand2 className="h-4 w-4" />,
  lyrics: <Mic2 className="h-4 w-4" />,
  mood: <Globe2 className="h-4 w-4" />,
};

interface TrackIntegrationProps {
  trackId: string;
  currentModule: TrackIntegration["source_module"];
}

export function TrackIntegration({
  trackId,
  currentModule,
}: TrackIntegrationProps) {
  const [selectedModule, setSelectedModule] = useState<
    TrackIntegration["target_module"] | ""
  >("");
  const [isPorting, setIsPorting] = useState(false);

  const {
    integrations,
    isLoadingIntegrations,
    portTrack,
    accessInfo,
    isCheckingAccess,
  } = useTrackIntegration(trackId);

  const handlePort = async () => {
    if (!selectedModule) return;

    setIsPorting(true);
    try {
      await portTrack({
        track_id: trackId,
        target_module: selectedModule,
      });
      setSelectedModule("");
    } finally {
      setIsPorting(false);
    }
  };

  const availableModules = ["studio", "dj", "lyrics", "mood"].filter(
    (m) => m !== currentModule,
  ) as TrackIntegration["target_module"][];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Module Integration</h3>
        {accessInfo && accessInfo.has_access === false && (
          <Badge variant="outline" className="gap-1">
            <Lock className="h-3 w-3" />
            Limited Access
          </Badge>
        )}
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Select
              value={selectedModule}
              onValueChange={(value: TrackIntegration["target_module"]) =>
                setSelectedModule(value)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {availableModules.map((module) => (
                  <SelectItem key={module} value={module}>
                    <div className="flex items-center gap-2">
                      {MODULE_ICONS[module as keyof typeof MODULE_ICONS]}
                      <span className="capitalize">{module}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handlePort}
              disabled={!selectedModule || isPorting}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              {isPorting ? "Porting..." : "Port to Module"}
            </Button>
          </div>

          {integrations && integrations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Integration History</h4>
              <div className="space-y-2">
                {integrations.map((integration: TrackIntegration) => (
                  <Card key={integration.created_at} className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {MODULE_ICONS[integration.target_module as keyof typeof MODULE_ICONS]}
                        <span className="text-sm capitalize">
                          {integration.target_module}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          backgroundColor: integration.emotional_context?.color,
                          borderColor: integration.emotional_context?.color,
                        }}
                      >
                        {integration.emotional_context?.mood_name}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {isLoadingIntegrations && (
            <div className="flex items-center justify-center py-4">
              <p className="text-sm text-muted-foreground">
                Loading integrations...
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
