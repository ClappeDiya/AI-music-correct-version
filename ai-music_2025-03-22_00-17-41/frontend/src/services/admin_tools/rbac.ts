import { axiosInstance } from "@/lib/axios";

const BASE_URL = "/api/admin_tools/rbac";

export type Permission =
  | "view_users"
  | "manage_users"
  | "view_content"
  | "manage_content"
  | "view_reports"
  | "manage_reports"
  | "view_audit_logs"
  | "manage_roles"
  | "manage_settings"
  | "override_ai"
  | "export_data"
  | "bulk_actions";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
  user_count: number;
}

export interface RoleAssignment {
  user_id: string;
  role_id: string;
  assigned_by: string;
  assigned_at: string;
}

export const rbacApi = {
  // Get all roles
  getRoles: async () => {
    const response = await axiosInstance.get(`${BASE_URL}/roles/`);
    return response.data;
  },

  // Get single role details
  getRole: async (roleId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/roles/${roleId}/`);
    return response.data as Role;
  },

  // Create new role
  createRole: async (data: {
    name: string;
    description: string;
    permissions: Permission[];
  }) => {
    const response = await axiosInstance.post(`${BASE_URL}/roles/`, data);
    return response.data;
  },

  // Update role
  updateRole: async (
    roleId: string,
    data: {
      name?: string;
      description?: string;
      permissions?: Permission[];
    },
  ) => {
    const response = await axiosInstance.patch(
      `${BASE_URL}/roles/${roleId}/`,
      data,
    );
    return response.data;
  },

  // Delete role
  deleteRole: async (roleId: string) => {
    await axiosInstance.delete(`${BASE_URL}/roles/${roleId}/`);
  },

  // Get role assignments
  getRoleAssignments: async (params?: any) => {
    const response = await axiosInstance.get(`${BASE_URL}/assignments/`, {
      params,
    });
    return response.data;
  },

  // Assign role to user
  assignRole: async (userId: string, roleId: string) => {
    const response = await axiosInstance.post(`${BASE_URL}/assignments/`, {
      user_id: userId,
      role_id: roleId,
    });
    return response.data;
  },

  // Remove role from user
  removeRole: async (userId: string, roleId: string) => {
    await axiosInstance.delete(`${BASE_URL}/assignments/${userId}/${roleId}/`);
  },

  // Get available permissions
  getPermissions: async () => {
    const response = await axiosInstance.get(`${BASE_URL}/permissions/`);
    return response.data;
  },
};

// RBAC hook for checking permissions
export function usePermissions(userPermissions: Permission[]) {
  return {
    can: (permission: Permission) => userPermissions.includes(permission),
    canAny: (permissions: Permission[]) =>
      permissions.some((p) => userPermissions.includes(p)),
    canAll: (permissions: Permission[]) =>
      permissions.every((p) => userPermissions.includes(p)),
  };
}

// Permission groups for UI organization
export const permissionGroups = {
  users: {
    name: "User Management",
    permissions: ["view_users", "manage_users"],
  },
  content: {
    name: "Content Management",
    permissions: ["view_content", "manage_content"],
  },
  reports: {
    name: "Reports & Moderation",
    permissions: ["view_reports", "manage_reports", "override_ai"],
  },
  system: {
    name: "System Administration",
    permissions: [
      "manage_roles",
      "manage_settings",
      "view_audit_logs",
      "export_data",
    ],
  },
  actions: {
    name: "Actions",
    permissions: ["bulk_actions"],
  },
} as const;
