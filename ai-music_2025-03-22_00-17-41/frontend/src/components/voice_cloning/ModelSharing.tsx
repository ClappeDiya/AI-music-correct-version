"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useToast } from "@/components/ui/useToast";
import { VoiceModel, ModelShare, voiceCloning } from "@/services/api/voice_cloning";
import { Users, UserPlus, Trash2 } from "lucide-react";

interface ModelSharingProps {
  model: VoiceModel;
  onUpdate: (model: VoiceModel) => void;
}

export function ModelSharing({ model, onUpdate }: ModelSharingProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"view" | "edit" | "admin">(
    "view",
  );
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const response = await voiceCloning.shareModel(model.id, {
        user_email: email,
        permission,
      });
      onUpdate(response.data);
      setEmail("");
      toast({
        title: "Model Shared",
        description: "User has been granted access to the model",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share model",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleRemoveShare = async (shareId: number) => {
    try {
      await voiceCloning.removeShare(model.id, shareId);
      const response = await voiceCloning.getVoiceModel(model.id);
      onUpdate(response.data);
      toast({
        title: "Access Removed",
        description: "User's access has been revoked",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove access",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Share Model
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input
              placeholder="Enter email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Select
              value={permission}
              onValueChange={(value: "view" | "edit" | "admin") =>
                setPermission(value)
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleShare} disabled={!email || isSharing}>
              <UserPlus className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Shared With</h3>
            {!model.shares || model.shares.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This model hasn't been shared with anyone yet
              </p>
            ) : (
              <div className="space-y-2">
                {model.shares.map((share: ModelShare) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{share.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {share.permission}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveShare(share.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
