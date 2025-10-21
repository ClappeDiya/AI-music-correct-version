import { axiosInstance } from "@/lib/axios";

const BASE_URL = "/api/admin_tools/audit";

export interface AuditLog {
  id: string;
  timestamp: string;
  action_type:
    | "content_removal"
    | "user_ban"
    | "user_warning"
    | "user_suspension"
    | "content_approval"
    | "report_resolution"
    | "ai_override"
    | "settings_change";
  moderator: {
    id: string;
    username: string;
    role: string;
  };
  target_type: "user" | "content" | "report" | "system";
  target_ref: string;
  details: {
    reason?: string;
    previous_state?: any;
    new_state?: any;
    notes?: string;
    duration?: number;
  };
  related_user?: {
    id: string;
    username: string;
  };
}

export interface ExportOptions {
  format: "csv" | "pdf";
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: {
    action_type?: string[];
    moderator_id?: string;
    target_type?: string;
  };
}

export const auditLogsApi = {
  // Get audit logs with filtering
  getLogs: async (params?: any) => {
    const response = await axiosInstance.get(`${BASE_URL}/logs/`, { params });
    return response.data;
  },

  // Get single log details
  getLogDetails: async (logId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/logs/${logId}/`);
    return response.data as AuditLog;
  },

  // Export logs
  exportLogs: async (options: ExportOptions) => {
    const response = await axiosInstance.post(`${BASE_URL}/export/`, options, {
      responseType: "blob",
    });
    return response.data;
  },

  // Get audit statistics
  getStats: async (dateRange?: { from: string; to: string }) => {
    const response = await axiosInstance.get(`${BASE_URL}/stats/`, {
      params: dateRange,
    });
    return response.data;
  },
};
