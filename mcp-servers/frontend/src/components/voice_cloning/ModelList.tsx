"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/useToast";
import { Mic2, Settings, History, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { VoiceModel, voiceCloning } from "@/services/api/voice_cloning";

interface ModelListProps {
  models: VoiceModel[];
  onModelUpdate: (model: VoiceModel) => void;
}

export function ModelList({ models, onModelUpdate }: ModelListProps) {
  const [updating, setUpdating] = useState<number | null>(null);
  const { toast } = useToast();

  const handleToggleActive = async (modelId: number, isActive: boolean) => {
    try {
      setUpdating(modelId);
      const response = await voiceCloning.updateVoiceModel(modelId, {
        is_active: isActive,
      });
      onModelUpdate(response.data);
      toast({
        title: "Model Updated",
        description: `Model ${isActive ? "activated" : "deactivated"} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update model status",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      {models.map((model) => (
        <Card key={model.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">
              <div className="flex items-center gap-2">
                <Mic2 className="h-5 w-5" />
                {model.name}
                {model.is_encrypted && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge
                variant={model.status === "ready" ? "default" : "secondary"}
              >
                {model.status}
              </Badge>
              <Switch
                checked={model.is_active}
                onCheckedChange={(checked) =>
                  handleToggleActive(model.id, checked)
                }
                disabled={updating === model.id || model.status !== "ready"}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm font-medium">Version</p>
                <p className="text-sm text-muted-foreground">
                  {model.version || "V1"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(model.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Languages</p>
                <p className="text-sm text-muted-foreground">
                  {model.supported_languages.join(", ")}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  (window.location.href = `/voice_cloning/models/${model.id}/history`)
                }
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  (window.location.href = `/voice_cloning/models/${model.id}/settings`)
                }
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
