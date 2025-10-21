import { axiosInstance } from "@/lib/axios";

const BASE_URL = "/api/admin_tools/notifications";

export type NotificationPriority = "low" | "medium" | "high" | "critical";
export type NotificationType =
  | "content_flag"
  | "user_report"
  | "escalation_request"
  | "legal_issue"
  | "system_alert"
  | "ai_flag";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  metadata: {
    content_ref?: string;
    user_ref?: string;
    report_id?: string;
    escalation_id?: string;
    flag_count?: number;
    severity_score?: number;
  };
  created_at: string;
  read_at: string | null;
  actioned_at: string | null;
  actioned_by: string | null;
}

export interface EscalationRequest {
  id: string;
  status: "pending" | "in_review" | "resolved" | "rejected";
  priority: NotificationPriority;
  type: "content" | "user" | "legal" | "other";
  title: string;
  description: string;
  metadata: {
    content_ref?: string;
    user_ref?: string;
    evidence?: string[];
    legal_references?: string[];
  };
  created_by: {
    id: string;
    username: string;
    role: string;
  };
  created_at: string;
  assigned_to: {
    id: string;
    username: string;
    role: string;
  } | null;
  resolved_at: string | null;
  resolution_notes: string | null;
}

export const notificationsApi = {
  // Get notifications
  getNotifications: async (params?: any) => {
    const response = await axiosInstance.get(`${BASE_URL}/`, { params });
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/${notificationId}/read/`,
    );
    return response.data;
  },

  // Mark notification as actioned
  markAsActioned: async (notificationId: string) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/${notificationId}/action/`,
    );
    return response.data;
  },

  // Create escalation request
  createEscalation: async (data: {
    type: EscalationRequest["type"];
    priority: NotificationPriority;
    title: string;
    description: string;
    metadata: EscalationRequest["metadata"];
  }) => {
    const response = await axiosInstance.post(`${BASE_URL}/escalations/`, data);
    return response.data;
  },

  // Get escalation requests
  getEscalations: async (params?: any) => {
    const response = await axiosInstance.get(`${BASE_URL}/escalations/`, {
      params,
    });
    return response.data;
  },

  // Update escalation status
  updateEscalation: async (
    escalationId: string,
    data: {
      status: EscalationRequest["status"];
      assigned_to?: string;
      resolution_notes?: string;
    },
  ) => {
    const response = await axiosInstance.patch(
      `${BASE_URL}/escalations/${escalationId}/`,
      data,
    );
    return response.data;
  },

  // Get notification preferences
  getPreferences: async () => {
    const response = await axiosInstance.get(`${BASE_URL}/preferences/`);
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (data: {
    email_notifications: boolean;
    desktop_notifications: boolean;
    notification_types: NotificationType[];
    minimum_priority: NotificationPriority;
  }) => {
    const response = await axiosInstance.patch(
      `${BASE_URL}/preferences/`,
      data,
    );
    return response.data;
  },
};
