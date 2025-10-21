import { useState } from "react";
import { format } from "date-fns";
import { useMoodAnalytics } from "@/hooks/UseMoodAnalytics";
import {
  TrackAnalytics,
  UserMoodAnalytics,
  MoodFeedbackMetrics
} from "@/lib/api/services/mood-analytics";
import { 
  AlertCircle, 
  BarChart,
  LineChart,
  RefreshCcw,
  SkipForward,
  ThumbsDown,
  ThumbsUp,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import { AxiosResponse } from "axios";

// Model interface for suggestions response
interface ModelSuggestionResponse {
  suggestions: Array<{
    mood_id: number;
    mood_name: string;
    current_accuracy: number;
    improvement_areas: string[];
  }>;
}

interface MoodAnalyticsProps {
  trackId?: string;
}

export function MoodAnalytics({ trackId }: MoodAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const {
    trackAnalytics,
    userAnalytics,
    submitFeedback,
    modelSuggestions,
    isLoadingTrackAnalytics,
    isLoadingUserAnalytics,
    isLoadingModelSuggestions,
  } = useMoodAnalytics(trackId);

  // Type assertions
  const trackData = trackAnalytics as TrackAnalytics | undefined;
  const userData = userAnalytics as UserMoodAnalytics | undefined;
  const suggestions = modelSuggestions as ModelSuggestionResponse | undefined;

  const StatCard = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
  }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h4 className="text-2xl font-semibold mt-1">{value}</h4>
        </div>
        {icon}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Mood Analytics</h3>
        <Badge variant="outline" className="gap-1">
          <BarChart className="h-3 w-3" />
          Analytics Beta
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {isLoadingTrackAnalytics || isLoadingUserAnalytics ? (
            <p>Loading analytics...</p>
          ) : !trackId ? (
            // User-level overview
            userData ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    title="Total Tracks"
                    value={userData.total_tracks}
                    icon={<RefreshCcw className="h-8 w-8 text-primary opacity-20" />}
                  />
                  <StatCard
                    title="Favorite Mood"
                    value={userData.favorite_moods.length > 0 ? userData.favorite_moods[0].mood_name : "None"}
                    icon={<TrendingUp className="h-8 w-8 text-primary opacity-20" />}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Mood Accuracy</h4>
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Overall</p>
                        <Badge
                          variant={
                            userData.mood_accuracy.overall_score > 0.7
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {Math.round(userData.mood_accuracy.overall_score * 100)}%
                        </Badge>
                      </div>
                      <Progress
                        value={userData.mood_accuracy.overall_score * 100}
                        className="h-2"
                      />

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">By Mood</p>
                        {userData.favorite_moods.map((mood) => (
                          <div
                            key={mood.mood_id}
                            className="flex items-center justify-between"
                          >
                            <p className="text-sm">{mood.mood_name}</p>
                            <Badge
                              variant={
                                mood.success_rate > 0.7 ? "outline" : "destructive"
                              }
                            >
                              {Math.round(mood.success_rate * 100)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            ) : (
              <p>No user analytics data available.</p>
            )
          ) : trackData ? (
            // Track-specific overview
            <>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Play Count"
                  value={trackData.metrics.play_count}
                  icon={<RefreshCcw className="h-8 w-8 text-primary opacity-20" />}
                />
                <StatCard
                  title="Completion Rate"
                  value={`${Math.round(trackData.metrics.completion_rate * 100)}%`}
                  icon={<RefreshCcw className="h-8 w-8 text-primary opacity-20" />}
                />
                <StatCard
                  title="Play Duration"
                  value={`${trackData.metrics.average_play_duration.toFixed(1)}s`}
                  icon={<TrendingUp className="h-8 w-8 text-primary opacity-20" />}
                />
                <StatCard
                  title="Skip Rate"
                  value={`${Math.round((trackData.metrics.skip_count / trackData.metrics.play_count) * 100)}%`}
                  icon={<SkipForward className="h-8 w-8 text-primary opacity-20" />}
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Mood Accuracy</h4>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Intended: {trackData.mood_accuracy.intended.mood_name}</p>
                      <p className="text-sm">Intensity: {trackData.mood_accuracy.intended.intensity}/10</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Perceived: {trackData.mood_accuracy.perceived.mood_name}</p>
                      <Badge
                        variant={
                          trackData.mood_accuracy.perceived.confidence > 0.7
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {Math.round(trackData.mood_accuracy.perceived.confidence * 100)}%
                      </Badge>
                    </div>
                    <Progress
                      value={trackData.mood_accuracy.perceived.confidence * 100}
                      className="h-2"
                    />
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <p>No track analytics data available.</p>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          {isLoadingTrackAnalytics || isLoadingUserAnalytics ? (
            <p>Loading feedback...</p>
          ) : !trackId ? (
            // User-level feedback
            userData ? (
              <>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Feedback</h4>
                  <Card>
                    {userData.recent_feedback.map((feedback) => (
                      <div
                        key={feedback.track_id}
                        className="p-3 border-b last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {feedback.feedback_type === "like" ? (
                              <ThumbsUp className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <ThumbsDown className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <p className="text-sm">
                              {feedback.mood_name}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(feedback.created_at), "MMM d, yyyy")}
                          </Badge>
                        </div>
                        {feedback.feedback_notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            "{feedback.feedback_notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </Card>
                </div>
              </>
            ) : (
              <p>No user feedback data available.</p>
            )
          ) : trackData ? (
            // Track-specific feedback
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Feedback Summary</h4>
                <Card className="p-4">
                  <div className="flex items-center justify-around">
                    <div className="flex flex-col items-center">
                      <ThumbsUp className="h-8 w-8 text-green-500 opacity-80" />
                      <p className="text-2xl font-semibold mt-2">
                        {
                          trackData.feedback.filter(
                            (item) => item.type === "like"
                          ).length
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <ThumbsDown className="h-8 w-8 text-red-500 opacity-80" />
                      <p className="text-2xl font-semibold mt-2">
                        {
                          trackData.feedback.filter(
                            (item) => item.type === "dislike"
                          ).length
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">Dislikes</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Feedback Details</h4>
                <Card>
                  {trackData.feedback.map((feedback, index) => (
                    <div
                      key={`${feedback.created_at}-${index}`}
                      className="p-3 border-b last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {feedback.type === "like" ? (
                            <ThumbsUp className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <p className="text-sm">
                            {feedback.type === "like" ? "Liked" : "Disliked"}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(feedback.created_at), "MMM d, yyyy")}
                        </Badge>
                      </div>
                      {feedback.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          "{feedback.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </Card>
              </div>
            </>
          ) : (
            <p>No track feedback data available.</p>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  Improvement Suggestions
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (trackId) {
                      submitFeedback({
                        trackId,
                        feedback: {
                          accuracy_rating: 0,
                          perceived_intensity: 0,
                          issues: ['Need suggestions']
                        }
                      });
                    }
                  }}
                  disabled={isLoadingModelSuggestions || !trackId}
                >
                  <RefreshCcw className="h-3 w-3 mr-2" />
                  Refresh
                </Button>
              </div>

              {isLoadingModelSuggestions ? (
                <p className="text-sm">Loading suggestions...</p>
              ) : !suggestions?.suggestions?.length ? (
                <p className="text-sm">No suggestions available.</p>
              ) : (
                <div className="space-y-4">
                  {suggestions.suggestions.map((suggestion) => (
                    <div key={suggestion.mood_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-semibold">
                          {suggestion.mood_name}
                        </h5>
                        <Badge variant="outline">
                          {Math.round(suggestion.current_accuracy * 100)}%
                          Accuracy
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {suggestion.improvement_areas.map((area, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <p>{area}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {(isLoadingTrackAnalytics ||
        isLoadingUserAnalytics ||
        isLoadingModelSuggestions) && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      )}
    </div>
  );
}
