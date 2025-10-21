import { axiosInstance } from "@/lib/axios";

const BASE_URL = "/api/admin_tools";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  status: "active" | "suspended" | "banned" | "warned";
  created_at: string;
  last_active: string;
  violation_count: number;
  open_reports: number;
  recent_activity: {
    type: string;
    content_ref: string;
    timestamp: string;
  }[];
}

export interface UserAction {
  type: "warning" | "suspension" | "ban";
  reason: string;
  duration?: number; // in days, for suspension
  notes?: string;
}

export const userManagementApi = {
  // Get list of users with filters
  getUsers: async (params?: any) => {
    const response = await axiosInstance.get(`${BASE_URL}/users/`, { params });
    return response.data;
  },

  // Get detailed user profile
  getUserProfile: async (userId: string) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/users/${userId}/profile/`,
    );
    return response.data;
  },

  // Take action on user (warn/suspend/ban)
  takeAction: async (userId: string, action: UserAction) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/users/${userId}/action/`,
      action,
    );
    return response.data;
  },

  // Get user violation history
  getViolationHistory: async (userId: string) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/users/${userId}/violations/`,
    );
    return response.data;
  },

  // Get user activity summary
  getActivitySummary: async (userId: string) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/users/${userId}/activity/`,
    );
    return response.data;
  },
};
