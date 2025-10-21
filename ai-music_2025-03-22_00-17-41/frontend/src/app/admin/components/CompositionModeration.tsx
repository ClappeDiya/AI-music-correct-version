"use client";
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/usetoast";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  SearchIcon,
  LockClosedIcon,
  UsersIcon,
  GlobeIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Composition {
  id: string;
  title: string;
  user: {
    id: string;
    name: string;
  };
  privacy: "private" | "friends" | "public";
  status: "active" | "flagged" | "removed";
  createdAt: string;
  reportCount: number;
}

interface CompositionModerationProps {
  initialCompositions: Composition[];
  onUpdateStatus: (
    id: string,
    status: "active" | "flagged" | "removed",
  ) => Promise<void>;
}

export function CompositionModeration({
  initialCompositions,
  onUpdateStatus,
}: CompositionModerationProps) {
  const [compositions, setCompositions] = useState(initialCompositions);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "flagged" | "removed">("all");
  const { toast } = useToast();

  const filteredCompositions = compositions
    .filter((comp) => {
      if (filter === "all") return true;
      return comp.status === filter;
    })
    .filter(
      (comp) =>
        comp.title.toLowerCase().includes(search.toLowerCase()) ||
        comp.user.name.toLowerCase().includes(search.toLowerCase()),
    );

  const handleStatusUpdate = async (
    id: string,
    status: "active" | "flagged" | "removed",
  ) => {
    try {
      await onUpdateStatus(id, status);
      setCompositions((comps) =>
        comps.map((comp) => (comp.id === id ? { ...comp, status } : comp)),
      );
      toast({
        title: "Status Updated",
        description: `Composition status changed to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update composition status",
        variant: "destructive",
      });
    }
  };

  const getPrivacyBadge = (privacy: "private" | "friends" | "public") => {
    const variants = {
      private: "outline",
      friends: "default",
      public: "secondary",
    };

    const icons = {
      private: <LockClosedIcon className="h-3 w-3 mr-1" />,
      friends: <UsersIcon className="h-3 w-3 mr-1" />,
      public: <GlobeIcon className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant={variants[privacy]} className="ml-2">
        {icons[privacy]}
        {privacy.charAt(0).toUpperCase() + privacy.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Moderation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search compositions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={filter}
            onValueChange={(value: "all" | "flagged" | "removed") =>
              setFilter(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Privacy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompositions.map((comp) => (
                <TableRow key={comp.id}>
                  <TableCell>{comp.title}</TableCell>
                  <TableCell>{comp.user.name}</TableCell>
                  <TableCell>{getPrivacyBadge(comp.privacy)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        comp.status === "active"
                          ? "default"
                          : comp.status === "flagged"
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {comp.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{comp.reportCount}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(comp.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {comp.status !== "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(comp.id, "active")}
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {comp.status !== "flagged" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(comp.id, "flagged")}
                        >
                          <AlertCircleIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {comp.status !== "removed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(comp.id, "removed")}
                        >
                          <XCircleIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
