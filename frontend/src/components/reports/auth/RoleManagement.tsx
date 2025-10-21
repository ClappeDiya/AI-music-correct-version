"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  UserPlus,
  UserMinus,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { useToast } from "@/components/ui/useToast";
import { useReportPermissions } from "./use-report-permissions";
import { authApi } from "@/lib/api/auth";

interface User {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

const availableRoles = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full access to all reports and role management",
  },
  {
    id: "analyst",
    name: "Analyst",
    description: "Can generate and view all reports except revenue",
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Can only view basic reports and dashboards",
  },
];

const availablePermissions = [
  {
    id: "generate_reports",
    name: "Generate Reports",
    description: "Can create new reports",
  },
  {
    id: "access_revenue",
    name: "Access Revenue Data",
    description: "Can view revenue-related reports",
  },
  {
    id: "access_demographics",
    name: "Access Demographics",
    description: "Can view user demographic data",
  },
  {
    id: "export_data",
    name: "Export Data",
    description: "Can export report data",
  },
  {
    id: "configure_kpis",
    name: "Configure KPIs",
    description: "Can create and modify KPI dashboards",
  },
];

export function RoleManagement() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { can } = useReportPermissions();

  // Fetch users and their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ["users-roles"],
    queryFn: () => authApi.getUsersWithRoles(),
  });

  // Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
      permissions,
    }: {
      userId: string;
      role: string;
      permissions: string[];
    }) => {
      await authApi.updateUserRole(userId, { role, permissions });
      // Log the role change for audit
      await authApi.logAuditEvent({
        type: "role_update",
        userId,
        details: { role, permissions },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-roles"] });
      toast({
        title: "Role Updated",
        description:
          "User role and permissions have been updated successfully.",
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!can.manageRoles()) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        You don't have permission to manage roles.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage user roles and permissions for reports
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Assign Role
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{user.role}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.map((permission) => (
                      <div
                        key={permission}
                        className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs"
                      >
                        {permission}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setOpen(true);
                    }}
                  >
                    Edit Role
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Edit User Role" : "Assign New Role"}
            </DialogTitle>
            <DialogDescription>
              Update role and permissions for this user
            </DialogDescription>
          </DialogHeader>

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedUser) return;

              const formData = new FormData(e.currentTarget);
              const role = formData.get("role") as string;
              const permissions = availablePermissions
                .filter((p) => formData.get(p.id) === "on")
                .map((p) => p.id);

              updateRoleMutation.mutate({
                userId: selectedUser.id,
                role,
                permissions,
              });
            }}
          >
            <div className="grid gap-4 py-4">
              <FormField
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      defaultValue={selectedUser?.role}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex flex-col">
                              <span>{role.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {role.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Permissions</FormLabel>
                {availablePermissions.map((permission) => (
                  <FormField
                    key={permission.id}
                    name={permission.id}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{permission.name}</FormLabel>
                          <FormDescription>
                            {permission.description}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateRoleMutation.isPending}>
                {updateRoleMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : selectedUser ? (
                  "Update Role"
                ) : (
                  "Assign Role"
                )}
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
