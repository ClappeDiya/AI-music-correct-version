import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeedbackHistoryProps {
  className?: string;
}

interface FeedbackItem {
  id: string;
  type: "like" | "dislike" | "tweak";
  rating?: number;
  feedback?: string;
  createdAt: string;
  trackName: string;
}

export const FeedbackHistory: React.FC<FeedbackHistoryProps> = ({
  className,
}) => {
  const [feedbackHistory, setFeedbackHistory] = React.useState<FeedbackItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/music/feedback/history");
        if (!response.ok) throw new Error("Failed to fetch feedback history");
        const data = await response.json();
        setFeedbackHistory(data);
      } catch (error) {
        console.error("Error fetching feedback history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case "like":
        return "bg-green-500";
      case "dislike":
        return "bg-red-500";
      case "tweak":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className={className}>
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Your Feedback History</h2>
        <ScrollArea className="h-[400px] rounded-md border">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {feedbackHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={getFeedbackTypeColor(item.type)}
                        >
                          {item.type.charAt(0).toUpperCase() +
                            item.type.slice(1)}
                        </Badge>
                        {item.rating && (
                          <Badge variant="outline">
                            Rating: {item.rating}/5
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium">{item.trackName}</h3>
                      {item.feedback && (
                        <p className="text-sm text-muted-foreground">
                          "{item.feedback}"
                        </p>
                      )}
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {format(new Date(item.createdAt), "MMM d, yyyy")}
                    </time>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};
