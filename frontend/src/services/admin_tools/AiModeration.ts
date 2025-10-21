import { axiosInstance } from "@/lib/axios";

const BASE_URL = "/api/admin_tools/ai_moderation";

export interface ContentFlag {
  id: string;
  content_ref: string;
  content_type: "lyrics" | "comment" | "profile" | "message";
  flag_type: "hate_speech" | "explicit" | "copyright" | "other";
  confidence_score: number;
  status: "pending" | "approved" | "rejected" | "quarantined";
  created_at: string;
  details: {
    detected_phrases?: string[];
    similar_content?: string[];
    copyright_matches?: {
      source: string;
      similarity: number;
    }[];
  };
  moderator_notes?: string;
  user_id: string;
}

export interface ModeratorDecision {
  decision: "approve" | "reject" | "escalate";
  notes?: string;
}

export const aiModerationApi = {
  // Get all flagged content
  getFlaggedContent: async (params?: any) => {
    const response = await axiosInstance.get(`${BASE_URL}/flags/`, { params });
    return response.data;
  },

  // Get flagged content details
  getFlagDetails: async (flagId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/flags/${flagId}/`);
    return response.data as ContentFlag;
  },

  // Submit moderator decision
  submitDecision: async (flagId: string, decision: ModeratorDecision) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/flags/${flagId}/decision/`,
      decision,
    );
    return response.data;
  },

  // Get AI moderation stats
  getStats: async () => {
    const response = await axiosInstance.get(`${BASE_URL}/stats/`);
    return response.data;
  },

  // Retrain AI model with corrected decisions
  submitFeedback: async (
    flagId: string,
    feedback: {
      correct: boolean;
      reason?: string;
    },
  ) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/flags/${flagId}/feedback/`,
      feedback,
    );
    return response.data;
  },
};
