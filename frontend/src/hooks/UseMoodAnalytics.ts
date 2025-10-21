import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/useToast";
import { MoodAnalyticsService } from "@/lib/api/services/mood-analytics";
import type {
  TrackAnalytics,
  UserMoodAnalytics,
  MoodFeedbackMetrics,
} from "@/lib/api/services/mood-analytics";

export function useMoodAnalytics(trackId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get track analytics
  const { data: trackAnalytics, isLoading: isLoadingTrackAnalytics } =
    useQuery({
      queryKey: ["track-analytics", trackId],
      queryFn: () => MoodAnalyticsService.getTrackAnalytics(trackId!),
      enabled: !!trackId,
    });

  // Get user analytics
  const { data: userAnalytics, isLoading: isLoadingUserAnalytics } =
    useQuery({
      queryKey: ["user-analytics"],
      queryFn: () => MoodAnalyticsService.getUserAnalytics(),
    });

  // Get mood metrics
  const getMoodMetrics = (moodId: number) => {
    return useQuery({
      queryKey: ["mood-metrics", moodId],
      queryFn: () => MoodAnalyticsService.getMoodMetrics(moodId),
    });
  };

  // Track interaction
  const { mutate: trackInteraction } = useMutation({
    mutationFn: (params: {
      trackId: string;
      event: {
        type: "play" | "skip" | "replay" | "complete";
        duration?: number;
      };
    }) => MoodAnalyticsService.trackInteraction(params.trackId, params.event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["track-analytics"] });
    },
  });

  // Submit detailed feedback
  const { mutate: submitFeedback } = useMutation({
    mutationFn: (params: {
      trackId: string;
      feedback: {
        accuracy_rating: number;
        perceived_intensity: number;
        issues?: string[];
        notes?: string;
      }
    }) => MoodAnalyticsService.submitMoodFeedback(params.trackId, params.feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["track-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["user-analytics"] });
      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping improve the mood generation.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get model suggestions
  const { data: modelSuggestions, isLoading: isLoadingModelSuggestions } =
    useQuery({
      queryKey: ["model-suggestions"],
      queryFn: () => MoodAnalyticsService.getModelSuggestions(),
    });

  return {
    trackAnalytics,
    userAnalytics,
    getMoodMetrics,
    trackInteraction,
    submitFeedback,
    modelSuggestions,
    isLoadingTrackAnalytics,
    isLoadingUserAnalytics,
    isLoadingModelSuggestions,
  };
}
