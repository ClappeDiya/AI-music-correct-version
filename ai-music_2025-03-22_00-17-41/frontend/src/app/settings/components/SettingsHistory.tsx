"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/usetoast";
import { Loader2, History, RotateCcw, Clock } from "lucide-react";
import { format } from "date-fns";
import {
  settingsService,
  UserSettingsHistory,
} from "@/services/settings.service";

export function SettingsHistory() {
  const [history, setHistory] = useState<UserSettingsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await settingsService.getSettingsHistory();
      setHistory(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (historyId: number) => {
    try {
      await settingsService.revertToHistory(historyId);
      toast({
        title: "Success",
        description: "Settings reverted successfully",
      });
      loadHistory();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revert settings",
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
            <History className="h-5 w-5" />
            <span>Settings History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(entry.timestamp), "PPpp")}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Object.entries(entry.changes).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span>{" "}
                        {String(value)}
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevert(entry.id)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Revert
                </Button>
              </div>
            ))}

            {history.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No history available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
