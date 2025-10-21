import { axiosInstance } from "@/lib/axios";

const BASE_URL = "/api/admin_tools";

// Types
export interface ModerationReason {
  id: number;
  reason_code: string;
  description: string | null;
  created_at: string;
}

export interface ReportedContent {
  id: number;
  reporter_user: string;
  content_ref: string;
  reason: ModerationReason;
  additional_details: any;
  reported_at: string;
  assigned_moderator: string | null;
  status: "unassigned" | "in_progress" | "resolved" | "escalated";
}

export interface ModerationAction {
  id: number;
  admin_user: string;
  target_ref: string;
  action_type: string;
  action_details: any;
  created_at: string;
}

// API Functions
export const adminToolsApi = {
  // Moderation Reasons
  getModerationReasons: async (params?: any) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/moderation-reasons/`,
      { params },
    );
    return response.data;
  },

  createModerationReason: async (data: Partial<ModerationReason>) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/moderation-reasons/`,
      data,
    );
    return response.data;
  },

  // Reported Content
  getReportedContent: async (params?: any) => {
    const response = await axiosInstance.get(`${BASE_URL}/reported-content/`, {
      params,
    });
    return response.data;
  },

  updateReportedContent: async (id: number, data: Partial<ReportedContent>) => {
    const response = await axiosInstance.put(
      `${BASE_URL}/reported-content/${id}/`,
      data,
    );
    return response.data;
  },

  // Moderation Actions
  getModerationActions: async (params?: any) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/moderation-actions/`,
      { params },
    );
    return response.data;
  },

  createModerationAction: async (data: Partial<ModerationAction>) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/moderation-actions/`,
      data,
    );
    return response.data;
  },

  // Add other API functions for remaining endpoints...
};
