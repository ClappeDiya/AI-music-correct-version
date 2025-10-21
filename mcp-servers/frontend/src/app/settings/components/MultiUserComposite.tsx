"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/usetoast";
import { Loader2, Users, Settings2, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  settingsService,
  MultiUserComposite,
} from "@/services/settings.service";

export function MultiUserComposite() {
  const [composites, setComposites] = useState<MultiUserComposite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadComposites();
  }, []);

  const loadComposites = async () => {
    try {
      const data = await settingsService.getMultiUserComposites();
      setComposites(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load multi-user composites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComposite = async () => {
    try {
      const newComposite = await settingsService.createMultiUserComposite({
        participant_user_ids: [],
        composite_prefs: {},
        active: true,
      });
      setComposites((prev) => [...prev, newComposite]);
      toast({
        title: "Success",
        description: "New composite created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create composite",
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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Multi-User Composites</h2>
        <Button onClick={handleCreateComposite}>
          <Users className="h-4 w-4 mr-2" />
          Create Composite
        </Button>
      </div>

      <div className="grid gap-6">
        {composites.map((composite) => (
          <Card key={composite.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Composite {composite.id}</span>
                </div>
                <Badge variant={composite.active ? "default" : "secondary"}>
                  {composite.active ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Participants</Label>
                <div className="flex -space-x-2 mt-2">
                  {composite.participant_user_ids.map((userId, index) => (
                    <Avatar key={userId} className="border-2 border-background">
                      <AvatarFallback>U{index + 1}</AvatarFallback>
                    </Avatar>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full ml-2"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Composite Preferences
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(composite.composite_prefs).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <span className="text-sm">{key}</span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
