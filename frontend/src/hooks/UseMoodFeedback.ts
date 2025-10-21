import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface FeedbackParams {
  trackId: string;
  feedbackType: "like" | "dislike";
  feedbackNotes?: string;
}

export function useMoodFeedback() {
  const queryClient = useQueryClient();

  const { mutate: submitFeedback } = useMutation({
    mutationFn: async (params: FeedbackParams) => {
      const response = await api.post(`/api/mood-feedback`, {
        track_id: params.trackId,
        feedback_type: params.feedbackType,
        feedback_notes: params.feedbackNotes,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mood-requests"] });
    },
  });

  return {
    submitFeedback,
  };
}
