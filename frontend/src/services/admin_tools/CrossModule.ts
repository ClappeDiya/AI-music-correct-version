import { axiosInstance } from "@/lib/axios";

const BASE_URL = "/api/admin_tools/cross_module";

export type ModuleType = "ai_dj" | "social" | "music_sharing" | "user_profile";

export interface ContentReference {
  id: string;
  module: ModuleType;
  content_type: string;
  reference_id: string;
  user_ref: string;
  metadata: {
    title?: string;
    description?: string;
    thumbnail_url?: string;
    duration?: number;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
  };
  flags: {
    id: string;
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    created_at: string;
    status: "pending" | "reviewed" | "resolved" | "false_positive";
  }[];
  related_refs: {
    id: string;
    module: ModuleType;
    content_type: string;
    reference_id: string;
    relationship_type: "parent" | "child" | "related";
  }[];
}

export interface ModuleStats {
  module: ModuleType;
  total_items: number;
  flagged_items: number;
  pending_review: number;
  resolved: number;
  false_positives: number;
}

export const crossModuleApi = {
  // Get content reference details
  getContentReference: async (referenceId: string) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/references/${referenceId}/`,
    );
    return response.data as ContentReference;
  },

  // Get related content references
  getRelatedReferences: async (referenceId: string) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/references/${referenceId}/related/`,
    );
    return response.data.results as ContentReference[];
  },

  // Get flagged content across modules
  getFlaggedContent: async (params?: {
    module?: ModuleType;
    content_type?: string;
    severity?: string;
    status?: string;
    user_ref?: string;
  }) => {
    const response = await axiosInstance.get(`${BASE_URL}/flagged/`, {
      params,
    });
    return response.data;
  },

  // Get module statistics
  getModuleStats: async () => {
    const response = await axiosInstance.get(`${BASE_URL}/stats/`);
    return response.data as ModuleStats[];
  },

  // Update content reference status
  updateContentStatus: async (
    referenceId: string,
    data: {
      status: "hidden" | "visible" | "under_review";
      notes?: string;
    },
  ) => {
    const response = await axiosInstance.patch(
      `${BASE_URL}/references/${referenceId}/status/`,
      data,
    );
    return response.data;
  },

  // Update flag status
  updateFlagStatus: async (
    referenceId: string,
    flagId: string,
    data: {
      status: "reviewed" | "resolved" | "false_positive";
      notes?: string;
    },
  ) => {
    const response = await axiosInstance.patch(
      `${BASE_URL}/references/${referenceId}/flags/${flagId}/`,
      data,
    );
    return response.data;
  },

  // Get user content across modules
  getUserContent: async (userRef: string, params?: any) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/users/${userRef}/content/`,
      { params },
    );
    return response.data;
  },

  // Validate content references
  validateReferences: async (references: string[]) => {
    const response = await axiosInstance.post(`${BASE_URL}/validate/`, {
      references,
    });
    return response.data;
  },
};
