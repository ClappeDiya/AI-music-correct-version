import { useState } from "react";
import { BarChart, Heart, ThumbsDown, ThumbsUp, Timer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/useToast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { lyricAdaptiveFeedbackApi } from "@/services/LyricsGenerationApi";
import type { LyricAdaptiveFeedback } from "@/types/LyricsGeneration";

interface AdaptiveFeedbackProps {
  finalLyricsId: number;
}

const eventTypes = {
  user_liked: { label: "Liked", icon: Heart, color: "text-red-500" },
  user_positive: { label: "Positive", icon: ThumbsUp, color: "text-green-500" },
  user_negative: {
    label: "Negative",
    icon: ThumbsDown,
    color: "text-yellow-500",
  },
  engagement_time: { label: "Engagement", icon: Timer, color: "text-blue-500" },
};

export function AdaptiveFeedback({ finalLyricsId }: AdaptiveFeedbackProps) {
  const [feedback, setFeedback] = useState<LyricAdaptiveFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const { toast } = useToast();

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await lyricAdaptiveFeedbackApi.getAll();
      setFeedback(data.filter((f) => f.final_lyrics === finalLyricsId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addFeedback = async (type: string, details?: Record<string, any>) => {
    try {
      await lyricAdaptiveFeedbackApi.create({
        final_lyrics: finalLyricsId,
        event_type: type,
        event_details: details,
      });
      loadFeedback();
      toast({
        title: "Success",
        description: "Feedback recorded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record feedback",
        variant: "destructive",
      });
    }
  };

  const filteredFeedback =
    selectedType === "all"
      ? feedback
      : feedback.filter((f) => f.event_type === selectedType);

  if (loading) {
    return (
      <Card className="p-6">
        <p>Loading feedback...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Quick Feedback</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addFeedback("user_liked")}
            >
              <Heart className="w-4 h-4 mr-2 text-red-500" />
              Like
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addFeedback("user_positive")}
            >
              <ThumbsUp className="w-4 h-4 mr-2 text-green-500" />
              Good
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addFeedback("user_negative")}
            >
              <ThumbsDown className="w-4 h-4 mr-2 text-yellow-500" />
              Needs Work
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {Object.entries(eventTypes).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={loadFeedback}>
            Refresh
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.map((item) => {
                const eventType =
                  eventTypes[item.event_type as keyof typeof eventTypes];
                const Icon = eventType?.icon || BarChart;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${eventType?.color || ""}`} />
                        <span>{eventType?.label || item.event_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.event_details ? (
                        <pre className="text-sm">
                          {JSON.stringify(item.event_details, null, 2)}
                        </pre>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredFeedback.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <p className="text-muted-foreground">No feedback found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Analytics</h3>
          <Badge variant="outline">Coming Soon</Badge>
        </div>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          Feedback analytics visualization will appear here
        </div>
      </Card>
    </div>
  );
}
