import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/useToast";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Stop,
  Music,
  Edit,
  History,
  Settings,
  Plus,
  Wand2,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";

interface Trigger {
  id: number;
  trigger_type: string;
  is_active: boolean;
  overlay_data: any;
  activated_at?: string;
}

interface TriggerHistory {
  id: number;
  trigger__trigger_type: string;
  created_at: string;
  deactivated_at?: string;
  is_active: boolean;
}

export function EphemeralTriggers() {
  const [supportedTriggers, setSupportedTriggers] = useState<any>({});
  const [activeTriggers, setActiveTriggers] = useState<Trigger[]>([]);
  const [triggerHistory, setTriggerHistory] = useState<TriggerHistory[]>([]);
  const [selectedTrigger, setSelectedTrigger] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    fetchSupportedTriggers();
    fetchActiveTriggers();
    fetchTriggerHistory();
  }, []);

  const fetchSupportedTriggers = async () => {
    try {
      const response = await fetch(
        "/api/settings/ephemeraltrigger/supported_triggers/",
      );
      const data = await response.json();
      setSupportedTriggers(data);
    } catch (error) {
      console.error("Error fetching supported triggers:", error);
    }
  };

  const fetchActiveTriggers = async () => {
    try {
      const response = await fetch(
        "/api/settings/ephemeraltrigger/active_triggers/",
      );
      const data = await response.json();
      setActiveTriggers(data);
    } catch (error) {
      console.error("Error fetching active triggers:", error);
    }
  };

  const fetchTriggerHistory = async () => {
    try {
      const response = await fetch("/api/settings/ephemeraltrigger/history/");
      const data = await response.json();
      setTriggerHistory(data);
    } catch (error) {
      console.error("Error fetching trigger history:", error);
    }
  };

  const createTrigger = async () => {
    if (!selectedTrigger) return;

    setIsCreating(true);
    try {
      const response = await fetch(
        "/api/settings/ephemeraltrigger/create_trigger/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trigger_type: selectedTrigger,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to create trigger");

      await fetchActiveTriggers();
      setSelectedTrigger("");

      toast({
        title: t("Trigger Created"),
        description: t("New trigger has been created successfully"),
      });
    } catch (error) {
      console.error("Error creating trigger:", error);
      toast({
        title: t("Creation Failed"),
        description: t("Failed to create trigger"),
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleTrigger = async (trigger: Trigger) => {
    try {
      const endpoint = trigger.is_active ? "deactivate" : "activate";
      await fetch(`/api/settings/ephemeraltrigger/${trigger.id}/${endpoint}/`, {
        method: "POST",
      });

      await fetchActiveTriggers();
      await fetchTriggerHistory();

      toast({
        title: t(
          trigger.is_active ? "Trigger Deactivated" : "Trigger Activated",
        ),
        description: t(
          trigger.is_active
            ? "Preferences restored to normal"
            : "Ephemeral preferences applied",
        ),
      });
    } catch (error) {
      console.error("Error toggling trigger:", error);
      toast({
        title: t("Action Failed"),
        description: t("Failed to toggle trigger"),
        variant: "destructive",
      });
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case "marathon_playlist":
        return <Music className="h-4 w-4" />;
      case "dj_session":
        return <Play className="h-4 w-4" />;
      case "editing_session":
        return <Edit className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5" />
            <div>
              <CardTitle>{t("Ephemeral Triggers")}</CardTitle>
              <CardDescription>
                {t("Automatically adjust preferences based on your activities")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">
                <Settings className="h-4 w-4 mr-2" />
                {t("Active Triggers")}
              </TabsTrigger>
              <TabsTrigger value="create">
                <Plus className="h-4 w-4 mr-2" />
                {t("Create New")}
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                {t("History")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeTriggers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  {t("No active triggers")}
                </div>
              ) : (
                activeTriggers.map((trigger) => (
                  <Card key={trigger.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTriggerIcon(trigger.trigger_type)}
                          <div>
                            <p className="font-medium">
                              {supportedTriggers[trigger.trigger_type]?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {
                                supportedTriggers[trigger.trigger_type]
                                  ?.description
                              }
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={
                            trigger.is_active ? "destructive" : "default"
                          }
                          size="sm"
                          onClick={() => toggleTrigger(trigger)}
                        >
                          {trigger.is_active ? (
                            <>
                              <Stop className="h-4 w-4 mr-2" />
                              {t("Stop")}
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              {t("Start")}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("Select Trigger Type")}</Label>
                  <Select
                    value={selectedTrigger}
                    onValueChange={setSelectedTrigger}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Choose a trigger type")} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(supportedTriggers).map(
                        ([key, value]: [string, any]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center space-x-2">
                              {getTriggerIcon(key)}
                              <div>
                                <p className="font-medium">{value.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {value.description}
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={createTrigger}
                  disabled={!selectedTrigger || isCreating}
                  className="w-full"
                >
                  {isCreating ? t("Creating...") : t("Create Trigger")}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {triggerHistory.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getTriggerIcon(entry.trigger__trigger_type)}
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">
                                  {
                                    supportedTriggers[
                                      entry.trigger__trigger_type
                                    ]?.name
                                  }
                                </p>
                                <Badge
                                  variant={
                                    entry.is_active ? "default" : "secondary"
                                  }
                                >
                                  {entry.is_active ? t("Active") : t("Ended")}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {t("Started")}: {formatDate(entry.created_at)}
                                {entry.deactivated_at && (
                                  <>
                                    {" "}
                                    | {t("Ended")}:{" "}
                                    {formatDate(entry.deactivated_at)}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
