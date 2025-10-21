import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFeatureFlagAdmin } from "@/lib/hooks/UseFeatureFlags";
import { formatDistanceToNow } from "date-fns";
import { Download, Filter, Search } from "lucide-react";

interface AuditLogViewerProps {
  environment: string;
}

export function AuditLogViewer({ environment }: AuditLogViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    action: "",
    user: "",
    dateRange: "",
  });

  // Mock data - replace with real API calls
  const auditLogs = [
    {
      id: "1",
      feature: "advanced-upload-features",
      user: "john.doe@example.com",
      action: "create",
      timestamp: "2025-01-28T15:30:00Z",
      changes: {
        status: ["inactive", "active"],
        percentage_rollout: [0, 100],
      },
    },
    {
      id: "2",
      feature: "batch-upload",
      user: "jane.smith@example.com",
      action: "update",
      timestamp: "2025-01-28T14:45:00Z",
      changes: {
        rules: {
          before: { operator: "and", conditions: [] },
          after: {
            operator: "and",
            conditions: [
              { property: "user.role", comparison: "equals", value: "admin" },
            ],
          },
        },
      },
    },
    // Add more mock data...
  ];

  const getActionBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      create: "bg-green-500",
      update: "bg-blue-500",
      delete: "bg-red-500",
      enable: "bg-purple-500",
      disable: "bg-yellow-500",
    };
    return colors[action] || "bg-gray-500";
  };

  const formatChanges = (changes: Record<string, any>) => {
    return Object.entries(changes)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value[0]} → ${value[1]}`;
        }
        if (typeof value === "object") {
          return `${key} modified`;
        }
        return `${key}: ${value}`;
      })
      .join(", ");
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (
      searchQuery &&
      !log.feature.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (filters.action && log.action !== filters.action) {
      return false;
    }
    if (
      filters.user &&
      !log.user.toLowerCase().includes(filters.user.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Audit Log</h2>
          <p className="text-sm text-muted-foreground">
            Track all changes to feature flags
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Log
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by feature name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <ScrollArea className="h-[600px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Changes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDistanceToNow(new Date(log.timestamp))} ago
                </TableCell>
                <TableCell>{log.feature}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getActionBadgeColor(log.action)}
                  >
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {formatChanges(log.changes)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
