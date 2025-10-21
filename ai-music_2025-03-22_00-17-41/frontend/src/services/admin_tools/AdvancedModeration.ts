import { axiosInstance } from "@/lib/axios";

const BASE_URL = "/api/admin_tools/advanced_moderation";

export interface AIAnalysisResult {
  content_type: "text" | "image" | "audio";
  confidence_score: number;
  detected_issues: {
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    confidence: number;
    details: string;
  }[];
  metadata: Record<string, any>;
}

export interface IPBanRule {
  ip_address: string;
  reason: string;
  expiry_date?: string;
  is_permanent: boolean;
  created_by: string;
  created_at: string;
}

export interface ModeratorFeedback {
  moderator_id: string;
  category: string;
  description: string;
  severity: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved";
  created_at: string;
  resolved_at?: string;
}

export const advancedModerationApi = {
  // AI Content Analysis
  analyzeContent: async (data: {
    content_id: string;
    content_type: "text" | "image" | "audio";
    content_url: string;
  }) => {
    const response = await axiosInstance.post(`${BASE_URL}/analyze/`, data);
    return response.data as AIAnalysisResult;
  },

  // Batch Analysis
  analyzeBatch: async (
    items: {
      content_id: string;
      content_type: "text" | "image" | "audio";
      content_url: string;
    }[],
  ) => {
    const response = await axiosInstance.post(`${BASE_URL}/analyze/batch/`, {
      items,
    });
    return response.data as AIAnalysisResult[];
  },

  // IP Ban Management
  getIPBans: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await axiosInstance.get(`${BASE_URL}/ip-bans/`, {
      params,
    });
    return response.data;
  },

  createIPBan: async (data: {
    ip_address: string;
    reason: string;
    duration_days?: number;
    is_permanent: boolean;
  }) => {
    const response = await axiosInstance.post(`${BASE_URL}/ip-bans/`, data);
    return response.data as IPBanRule;
  },

  removeIPBan: async (ip_address: string) => {
    await axiosInstance.delete(`${BASE_URL}/ip-bans/${ip_address}/`);
  },

  // Moderator Feedback
  submitFeedback: async (data: {
    category: string;
    description: string;
    severity: "low" | "medium" | "high";
  }) => {
    const response = await axiosInstance.post(`${BASE_URL}/feedback/`, data);
    return response.data as ModeratorFeedback;
  },

  getFeedback: async (params?: {
    status?: "open" | "in_progress" | "resolved";
    category?: string;
    severity?: "low" | "medium" | "high";
  }) => {
    const response = await axiosInstance.get(`${BASE_URL}/feedback/`, {
      params,
    });
    return response.data;
  },

  updateFeedback: async (
    feedbackId: string,
    data: {
      status: "open" | "in_progress" | "resolved";
      resolution_notes?: string;
    },
  ) => {
    const response = await axiosInstance.patch(
      `${BASE_URL}/feedback/${feedbackId}/`,
      data,
    );
    return response.data as ModeratorFeedback;
  },

  // Analytics and Insights
  getModeratorStats: async (params?: {
    start_date?: string;
    end_date?: string;
    moderator_id?: string;
  }) => {
    const response = await axiosInstance.get(`${BASE_URL}/stats/`, {
      params,
    });
    return response.data;
  },

  // Auto-moderation Rules
  getAutoModerationRules: async () => {
    const response = await axiosInstance.get(`${BASE_URL}/rules/`);
    return response.data;
  },

  updateAutoModerationRule: async (
    ruleId: string,
    data: {
      is_active: boolean;
      threshold?: number;
      action?: "flag" | "hide" | "delete";
    },
  ) => {
    const response = await axiosInstance.patch(
      `${BASE_URL}/rules/${ruleId}/`,
      data,
    );
    return response.data;
  },
};
