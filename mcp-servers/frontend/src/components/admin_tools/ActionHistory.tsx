import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Search, Filter } from "lucide-react";
import { adminToolsApi, ModerationAction } from "@/services/admin_tools/api";
import { useToast } from "@/components/ui/useToast";

export function ActionHistory() {
  const [data, setData] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionType, setActionType] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    try {
      const response = await adminToolsApi.getModerationActions({
        search: searchQuery,
        action_type: actionType,
      });
      setData(response.results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load action history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "admin_user",
      header: "Moderator",
    },
    {
      accessorKey: "action_type",
      header: "Action",
    },
    {
      accessorKey: "target_ref",
      header: "Target",
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
    },
    {
      accessorKey: "action_details",
      header: "Details",
      cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => console.log(row.original.action_details)}
        >
          View Details
        </Button>
      ),
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search actions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && loadActions()}
            />
          </div>
          <Select value={actionType} onValueChange={setActionType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="remove_content">Remove Content</SelectItem>
              <SelectItem value="warn_user">Warn User</SelectItem>
              <SelectItem value="suspend_user">Suspend User</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={loadActions}>Refresh</Button>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
