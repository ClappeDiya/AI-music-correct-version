import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  User,
  Search,
  MoreVertical,
  UserPlus,
  UserMinus,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { rbacApi, Role, RoleAssignment } from "@/services/admin_tools/rbac";
import { useToast } from "@/components/ui/useToast";

interface UserRoleAssignment extends RoleAssignment {
  user: {
    id: string;
    username: string;
    email: string;
  };
  role: Role;
}

export function UserRoleAssignments() {
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<UserRoleAssignment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, rolesData] = await Promise.all([
        rbacApi.getRoleAssignments({
          search: searchQuery,
          role: selectedRole,
        }),
        rbacApi.getRoles(),
      ]);
      setAssignments(assignmentsData.results);
      setRoles(rolesData.results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load assignments data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (formData: FormData) => {
    try {
      const userId = formData.get("user_id") as string;
      const roleId = formData.get("role_id") as string;

      await rbacApi.assignRole(userId, roleId);
      toast({ title: "Role assigned successfully" });
      setAssignDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRole = async () => {
    if (!selectedAssignment) return;

    try {
      await rbacApi.removeRole(
        selectedAssignment.user.id,
        selectedAssignment.role.id,
      );
      toast({ title: "Role removed successfully" });
      setRemoveDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      accessorKey: "user.username",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <div>
            <div className="font-medium">{row.original.user.username}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role.name",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="outline" className="flex items-center gap-1 w-fit">
          <Shield className="h-4 w-4" />
          {row.original.role.name}
        </Badge>
      ),
    },
    {
      accessorKey: "assigned_by",
      header: "Assigned By",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.assigned_by}
        </div>
      ),
    },
    {
      accessorKey: "assigned_at",
      header: "Assigned At",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {format(new Date(row.original.assigned_at), "PPp")}
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
                setSelectedAssignment(row.original);
                setRemoveDialogOpen(true);
              }}
              className="text-red-600"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Remove Role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading && !roles.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Role Assignments</h2>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
        <Button onClick={() => setAssignDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Assign Role
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && loadData()}
          />
        </div>

        <Select
          value={selectedRole}
          onValueChange={(value) => {
            setSelectedRole(value);
            loadData();
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={assignments} pagination />

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Assign a role to a user to grant them specific permissions
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAssignRole(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium">User ID</label>
              <Input name="user_id" placeholder="Enter user ID" required />
            </div>

            <div>
              <label className="text-sm font-medium">Role</label>
              <Select name="role_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Assign Role</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this role from the user? This will
              revoke their associated permissions.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveRole}>
              Remove Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
