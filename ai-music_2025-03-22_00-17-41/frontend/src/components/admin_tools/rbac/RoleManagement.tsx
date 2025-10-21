import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Checkbox } from "@/components/ui/Checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/Textarea";
import {
  Shield,
  Users,
  Settings,
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  CheckSquare,
} from "lucide-react";
import {
  rbacApi,
  Role,
  Permission,
  permissionGroups,
} from "@/services/admin_tools/rbac";
import { useToast } from "@/components/ui/useToast";

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        rbacApi.getRoles(),
        rbacApi.getPermissions(),
      ]);
      setRoles(rolesData.results);
      setPermissions(permissionsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load roles data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async (formData: FormData) => {
    try {
      const data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        permissions: Array.from(formData.getAll("permissions")) as Permission[],
      };

      if (selectedRole) {
        await rbacApi.updateRole(selectedRole.id, data);
        toast({ title: "Role updated successfully" });
      } else {
        await rbacApi.createRole(data);
        toast({ title: "Role created successfully" });
      }

      setEditDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await rbacApi.deleteRole(selectedRole.id);
      toast({ title: "Role deleted successfully" });
      setDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Role Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "user_count",
      header: "Users",
      cell: ({ row }) => (
        <Badge variant="secondary">
          <Users className="mr-1 h-4 w-4" />
          {row.original.user_count}
        </Badge>
      ),
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.permissions.length > 3 ? (
            <>
              {row.original.permissions.slice(0, 2).map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs">
                +{row.original.permissions.length - 2} more
              </Badge>
            </>
          ) : (
            row.original.permissions.map((permission) => (
              <Badge key={permission} variant="outline" className="text-xs">
                {permission}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedRole(row.original);
                setEditDialogOpen(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedRole(row.original);
                setDeleteDialogOpen(true);
              }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-muted-foreground">
            Manage roles and permissions for admin users
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedRole(null);
            setEditDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <DataTable columns={columns} data={roles} pagination />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Edit Role" : "Create Role"}
            </DialogTitle>
            <DialogDescription>
              Define the role and its permissions
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveRole(new FormData(e.currentTarget));
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Role Name</label>
                <Input name="name" defaultValue={selectedRole?.name} required />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  defaultValue={selectedRole?.description}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Permissions</label>
                <ScrollArea className="h-[300px] border rounded-md p-4">
                  <div className="space-y-6">
                    {Object.entries(permissionGroups).map(([key, group]) => (
                      <Card key={key}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {group.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {group.permissions.map((permission) => (
                            <div
                              key={permission}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                name="permissions"
                                value={permission}
                                defaultChecked={selectedRole?.permissions.includes(
                                  permission,
                                )}
                              />
                              <label className="text-sm">
                                {permission
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </label>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedRole ? "Update Role" : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be
              undone. Users with this role will lose their permissions.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
