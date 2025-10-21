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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  History,
  RotateCcw,
  Check,
  Clock,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { formatDistanceToNow } from "date-fns";

interface PredictiveEvent {
  id: number;
  context_data: any;
  applied_preferences: any;
  original_preferences: any;
  reason_code: string;
  created_at: string;
  is_active: boolean;
  user_accepted: boolean;
}

export function PredictivePreferences() {
  const [activePredictions, setActivePredictions] = useState<PredictiveEvent[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    fetchActivePredictions();
  }, []);

  const fetchActivePredictions = async () => {
    try {
      const response = await fetch(
        "/api/settings/predictivepreferencemodel/active_predictions/",
      );
      const data = await response.json();
      setActivePredictions(data);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  const handleRevert = async (eventId: number) => {
    try {
      await fetch(
        `/api/settings/predictivepreferenceevent/${eventId}/revert/`,
        {
          method: "POST",
        },
      );

      toast({
        title: t("Changes Reverted"),
        description: t(
          "Preferences have been restored to their previous state",
        ),
      });

      await fetchActivePredictions();
    } catch (error) {
      console.error("Error reverting prediction:", error);
      toast({
        title: t("Revert Failed"),
        description: t("Failed to revert changes"),
        variant: "destructive",
      });
    }
  };

  const handleAccept = async (eventId: number) => {
    try {
      await fetch(
        `/api/settings/predictivepreferenceevent/${eventId}/accept/`,
        {
          method: "POST",
        },
      );

      toast({
        title: t("Changes Accepted"),
        description: t("The predictive changes have been accepted"),
      });

      await fetchActivePredictions();
    } catch (error) {
      console.error("Error accepting prediction:", error);
      toast({
        title: t("Accept Failed"),
        description: t("Failed to accept changes"),
        variant: "destructive",
      });
    }
  };

  const formatReason = (code: string) => {
    return code
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getPreferenceChanges = (event: PredictiveEvent) => {
    const changes: string[] = [];

    Object.entries(event.applied_preferences).forEach(([category, values]) => {
      Object.entries(values as any).forEach(([key, value]) => {
        const original = event.original_preferences[category]?.[key];
        if (original !== value) {
          changes.push(`${category}.${key}: ${original} → ${value}`);
        }
      });
    });

    return changes;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <div>
              <CardTitle>{t("Predictive Preferences")}</CardTitle>
              <CardDescription>
                {t(
                  "Automatically adjusted settings based on your usage patterns",
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {activePredictions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("No active predictions")}</p>
                  <p className="text-sm">
                    {t(
                      "Your preferences will be automatically adjusted based on your usage",
                    )}
                  </p>
                </div>
              ) : (
                activePredictions.map((event) => (
                  <Alert
                    key={event.id}
                    variant={event.user_accepted ? "default" : "warning"}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <AlertTitle className="flex items-center space-x-2">
                          {event.user_accepted ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          <span>{formatReason(event.reason_code)}</span>
                          <Badge variant="outline" className="ml-2">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(event.created_at), {
                              addSuffix: true,
                            })}
                          </Badge>
                        </AlertTitle>
                        <AlertDescription>
                          <div className="mt-2 space-y-1">
                            {getPreferenceChanges(event).map(
                              (change, index) => (
                                <div key={index} className="text-sm">
                                  • {change}
                                </div>
                              ),
                            )}
                          </div>

                          {!event.user_accepted && (
                            <div className="mt-4 flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevert(event.id)}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                {t("Revert")}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAccept(event.id)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                {t("Accept")}
                              </Button>
                            </div>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
