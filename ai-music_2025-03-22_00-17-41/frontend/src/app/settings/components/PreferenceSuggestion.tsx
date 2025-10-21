"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/usetoast";
import { Loader2, Lightbulb, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  settingsService,
  PreferenceSuggestion,
} from "@/services/settings.service";
import { Badge } from "@/components/ui/Badge";

export function PreferenceSuggestion() {
  const [suggestions, setSuggestions] = useState<PreferenceSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const data = await settingsService.getPreferenceSuggestions();
      setSuggestions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (suggestionId: number) => {
    try {
      await settingsService.acceptSuggestion(suggestionId);
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
      toast({
        title: "Success",
        description: "Suggestion applied successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply suggestion",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = async (suggestionId: number) => {
    try {
      await settingsService.dismissSuggestion(suggestionId);
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
      toast({
        title: "Success",
        description: "Suggestion dismissed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dismiss suggestion",
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
            <Lightbulb className="h-5 w-5" />
            <span>Preference Suggestions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 border rounded-lg space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </div>
                  </div>
                  <Badge>{suggestion.category}</Badge>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDismiss(suggestion.id)}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                  <Button size="sm" onClick={() => handleAccept(suggestion.id)}>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                </div>
              </div>
            ))}

            {suggestions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No suggestions available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
