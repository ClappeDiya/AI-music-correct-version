import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from "@/components/ui/useToast";
import { Sparkles, Play, ThumbsUp, ThumbsDown } from "lucide-react";
import { Recommendation, Track } from '@/types/AiDj';
import { aiDjApi } from '@/lib/api/services/AiDj';

interface RecommendationsProps {
  recommendations: Recommendation[];
  onPlay?: (track: Track) => void;
}

export function Recommendations({ recommendations, onPlay }: RecommendationsProps) {
  const { toast } = useToast();

  const handleFeedback = async (recommendation: Recommendation, type: 'like' | 'dislike') => {
    try {
      await aiDjApi.createFeedback({
        recommendation: recommendation.id,
        feedback_type: type,
      });
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

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Your Recommendations</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id}>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>
                {new Date(recommendation.recommended_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendation.recommendation_data && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {/* Display recommendation details based on the data structure */}
                    {recommendation.recommendation_data.tracks?.map((track: Track) => (
                      <div key={track.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{track.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {track.artist}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPlay?.(track)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFeedback(recommendation, 'like')}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFeedback(recommendation, 'dislike')}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 

