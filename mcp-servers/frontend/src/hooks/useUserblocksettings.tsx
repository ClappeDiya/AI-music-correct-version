"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useToast } from "@/components/ui/usetoast";
import { UserX, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BlockedUser {
  id: string;
  username: string;
  blockedAt: string;
  reason?: string;
}

export function UserBlockSettings() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch("/api/users/blocked");
      if (!response.ok) throw new Error("Failed to fetch blocked users");
      const data = await response.json();
      setBlockedUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load blocked users. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/unblock`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to unblock user");

      setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
      toast({
        title: "Success",
        description: "User has been unblocked.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unblock user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Blocked Users
        </CardTitle>
        <CardDescription>
          Manage your blocked users and privacy settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {blockedUsers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Blocked Since</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-muted-foreground" />
                      {user.username}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(user.blockedAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.reason || "No reason provided"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(user.id)}
                    >
                      Unblock
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            You haven't blocked any users
          </div>
        )}
      </CardContent>
    </Card>
  );
}
