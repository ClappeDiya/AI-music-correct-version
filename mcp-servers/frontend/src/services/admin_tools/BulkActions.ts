import { axiosInstance } from "@/lib/axios";

const BASE_URL = "/api/admin_tools";

export interface BulkActionRequest {
  action: "remove" | "deactivate" | "warn" | "suspend" | "ban";
  targetIds: string[];
  reason: string;
  notes?: string;
  duration?: number; // for suspensions
}

export interface BulkActionProgress {
  total: number;
  completed: number;
  failed: number;
  status: "in_progress" | "completed" | "failed";
  errors?: { id: string; error: string }[];
}

export const bulkActionsApi = {
  // Perform bulk action on content or users
  performBulkAction: async (request: BulkActionRequest) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/bulk-actions/`,
      request,
    );
    return response.data;
  },

  // Get progress of a bulk action
  getBulkActionProgress: async (actionId: string) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/bulk-actions/${actionId}/progress/`,
    );
    return response.data as BulkActionProgress;
  },

  // Cancel an ongoing bulk action
  cancelBulkAction: async (actionId: string) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/bulk-actions/${actionId}/cancel/`,
    );
    return response.data;
  },
};
