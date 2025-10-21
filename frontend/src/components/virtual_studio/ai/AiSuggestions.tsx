import { useState, useEffect } from "react";
import { Sparkles, Check, X, Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AiSuggestion } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

interface AiSuggestionsProps {
  sessionId: number;
  onApplySuggestion: (suggestion: AiSuggestion) => void;
}

const suggestionTypeIcons: Record<string, JSX.Element> = {
  mix: <Sparkles className="h-4 w-4" />,
  arrangement: <RefreshCw className="h-4 w-4" />,
  effects: <Lightbulb className="h-4 w-4" />,
};

export function AiSuggestions({
  sessionId,
  onApplySuggestion,
}: AiSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await virtualStudioApi.getAiSuggestions({
        session: sessionId,
      });
      setSuggestions(data);
    } catch (error) {
      console.error("Error loading AI suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [sessionId]);

  const handleApplySuggestion = async (suggestion: AiSuggestion) => {
    try {
      const updatedSuggestion = {
        ...suggestion,
        applied: true,
      };
      await virtualStudioApi.createAiSuggestion(updatedSuggestion);
      onApplySuggestion(updatedSuggestion);

      // Update local state
      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestion.id ? { ...s, applied: true } : s)),
      );
    } catch (error) {
      console.error("Error applying suggestion:", error);
    }
  };

  const handleDismissSuggestion = async (suggestionId: number) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
  };

  const renderSuggestionContent = (suggestion: AiSuggestion) => {
    const data = suggestion.suggestion_data || {};

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">{data.description}</div>

        {data.parameters && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Suggested Parameters:</h4>
            <pre className="text-xs bg-muted p-2 rounded-md">
              {JSON.stringify(data.parameters, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDismissSuggestion(suggestion.id)}
          >
            <X className="h-4 w-4 mr-2" />
            Dismiss
          </Button>
          <Button
            size="sm"
            onClick={() => handleApplySuggestion(suggestion)}
            disabled={suggestion.applied}
          >
            <Check className="h-4 w-4 mr-2" />
            {suggestion.applied ? "Applied" : "Apply"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Suggestions
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSuggestions}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {suggestions.length > 0 ? (
            <Accordion type="single" collapsible>
              {suggestions.map((suggestion) => (
                <AccordionItem
                  key={suggestion.id}
                  value={suggestion.id.toString()}
                >
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      {suggestionTypeIcons[suggestion.suggestion_type || "mix"]}
                      <span>
                        {suggestion.suggestion_data?.title || "Suggestion"}
                      </span>
                      {suggestion.applied && (
                        <Badge variant="secondary" className="ml-2">
                          Applied
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderSuggestionContent(suggestion)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No AI suggestions available
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
