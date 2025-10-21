"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Slider } from "@/components/ui/Slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/useToast";
import {
  Wand2,
  Music,
  Settings2,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

interface AIPlugin {
  id: string;
  name: string;
  description: string;
  plugin_type: string;
  metadata: {
    genre_focus: string[];
    skill_level: string;
  };
}

interface AISuggestion {
  id: string;
  plugin_name: string;
  suggestion_type: string;
  content: any;
  confidence_score: number;
  status: "pending" | "accepted" | "rejected" | "modified";
}

interface UserPluginPreference {
  id: string;
  plugin_name: string;
  is_enabled: boolean;
  auto_apply: boolean;
  confidence_threshold: number;
  settings: any;
}

export default function AIPluginsPage() {
  const { toast } = useToast();
  const [plugins, setPlugins] = useState<AIPlugin[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [preferences, setPreferences] = useState<UserPluginPreference[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<AIPlugin | null>(null);

  useEffect(() => {
    fetchPlugins();
    fetchSuggestions();
    fetchPreferences();
  }, []);

  const fetchPlugins = async () => {
    try {
      const response = await api.get("/api/ai-plugins/");
      setPlugins(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch AI plugins",
        variant: "destructive",
      });
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get("/api/ai-suggestions/");
      setSuggestions(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch AI suggestions",
        variant: "destructive",
      });
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await api.get("/api/plugin-preferences/");
      setPreferences(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch plugin preferences",
        variant: "destructive",
      });
    }
  };

  const handleSuggestionAction = async (
    suggestionId: string,
    action: string,
  ) => {
    try {
      await api.post(`/api/ai-suggestions/${suggestionId}/${action}/`);
      fetchSuggestions();
      toast({
        title: "Success",
        description: `Suggestion ${action}ed successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} suggestion`,
        variant: "destructive",
      });
    }
  };

  const updatePluginPreference = async (
    pluginId: string,
    updates: Partial<UserPluginPreference>,
  ) => {
    try {
      await api.patch(`/api/plugin-preferences/${pluginId}/`, updates);
      fetchPreferences();
      toast({
        title: "Success",
        description: "Plugin preferences updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Plugins & Suggestions</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Settings2 className="w-4 h-4 mr-2" />
              Plugin Settings
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Plugin Preferences</SheetTitle>
              <SheetDescription>
                Configure your AI plugin preferences
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[500px] mt-4">
              {preferences.map((pref) => (
                <Card key={pref.id} className="p-4 mb-4">
                  <h3 className="font-semibold">{pref.plugin_name}</h3>
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span>Enable Plugin</span>
                      <Switch
                        checked={pref.is_enabled}
                        onCheckedChange={(checked) =>
                          updatePluginPreference(pref.id, {
                            is_enabled: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Auto Apply</span>
                      <Switch
                        checked={pref.auto_apply}
                        onCheckedChange={(checked) =>
                          updatePluginPreference(pref.id, {
                            auto_apply: checked,
                          })
                        }
                      />
                    </div>
                    <div>
                      <span>Confidence Threshold</span>
                      <Slider
                        value={[pref.confidence_threshold]}
                        min={0}
                        max={1}
                        step={0.1}
                        onValueChange={([value]) =>
                          updatePluginPreference(pref.id, {
                            confidence_threshold: value,
                          })
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map((plugin) => (
          <Card key={plugin.id} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{plugin.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {plugin.description}
                </p>
              </div>
              <Wand2 className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {plugin.metadata.genre_focus.map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-muted rounded-full text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <span className="mt-2 inline-block px-2 py-1 bg-primary/10 rounded-full text-xs">
                {plugin.metadata.skill_level}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Suggestions</h2>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">
                    {suggestion.plugin_name} - {suggestion.suggestion_type}
                  </h3>
                  <div className="mt-2">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(suggestion.content, null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleSuggestionAction(suggestion.id, "accept")
                    }
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleSuggestionAction(suggestion.id, "reject")
                    }
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedPlugin(suggestion)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    Confidence: {(suggestion.confidence_score * 100).toFixed(0)}
                    %
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    suggestion.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-700"
                      : suggestion.status === "accepted"
                        ? "bg-green-500/20 text-green-700"
                        : suggestion.status === "rejected"
                          ? "bg-red-500/20 text-red-700"
                          : "bg-blue-500/20 text-blue-700"
                  }`}
                >
                  {suggestion.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedPlugin && (
        <Dialog
          open={!!selectedPlugin}
          onOpenChange={() => setSelectedPlugin(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modify Suggestion</DialogTitle>
              <DialogDescription>
                Edit the suggestion before applying it
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(selectedPlugin.content, null, 2)}
              </pre>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPlugin(null)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  handleSuggestionAction(selectedPlugin.id, "modify")
                }
              >
                Apply Modified
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
