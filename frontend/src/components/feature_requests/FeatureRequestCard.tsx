"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThumbsUp, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FeatureRequest } from "@/services/featureRequestService";

interface FeatureRequestCardProps {
  featureRequest: FeatureRequest;
  onVote: (id: string) => Promise<void>;
  onUnvote: (id: string) => Promise<void>;
}

const categoryColors: Record<string, string> = {
  vr: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  collaboration: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ai: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  interface: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  audio: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

const statusIcons: Record<string, JSX.Element> = {
  pending: <Clock className="h-4 w-4 text-gray-500" />,
  approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  in_progress: <AlertCircle className="h-4 w-4 text-blue-500" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  declined: <XCircle className="h-4 w-4 text-red-500" />,
};

export function FeatureRequestCard({ featureRequest, onVote, onUnvote }: FeatureRequestCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  
  const handleVote = async () => {
    try {
      setIsVoting(true);
      if (featureRequest.has_voted) {
        await onUnvote(featureRequest.id);
      } else {
        await onVote(featureRequest.id);
      }
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">{featureRequest.title}</CardTitle>
          <Badge className={categoryColors[featureRequest.category] || categoryColors.other}>
            {featureRequest.category}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <span>By {featureRequest.submitted_by_name}</span>
          <span className="mx-2">•</span>
          <span>{formatDistanceToNow(new Date(featureRequest.created_at), { addSuffix: true })}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
          {featureRequest.description}
        </p>
      </CardContent>
      <CardFooter className="pt-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {statusIcons[featureRequest.status] || statusIcons.pending}
            <span className="ml-1 text-sm capitalize">{featureRequest.status.replace('_', ' ')}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Priority: <span className="capitalize">{featureRequest.priority}</span>
          </div>
        </div>
        <Button
          variant={featureRequest.has_voted ? "default" : "outline"}
          size="sm"
          onClick={handleVote}
          disabled={isVoting}
          className="ml-auto flex items-center gap-1"
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span>{featureRequest.votes_count}</span>
        </Button>
      </CardFooter>
    </Card>
  );
} 