"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { UserCheck, UserX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/componen../ui/card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/usetoast";
import { ScrollArea } from "@/components/ui/ScrollArea";

interface FollowRequest {
  id: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  requestedAt: string;
}

export function FollowRequests() {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFollowRequests();
  }, []);

  const fetchFollowRequests = async () => {
    try {
      const response = await fetch("/api/follow-requests");
      if (!response.ok) throw new Error("Failed to fetch follow requests");
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load follow requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (
    requestId: string,
    action: "accept" | "reject",
  ) => {
    try {
      const response = await fetch(
        `/api/follow-requests/${requestId}/${action}`,
        {
          method: "POST",
        },
      );

      if (!response.ok) throw new Error(`Failed to ${action} follow request`);

      setRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast({
        title: "Success",
        description: `Follow request ${action}ed successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} follow request`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <CardTitle>Follow Requests</CardTitle>
          </div>
          {requests.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {requests.length} pending request{requests.length !== 1 && "s"}
            </div>
          )}
        </div>
        <CardDescription>Manage people who want to follow you</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between space-x-4 rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={request.user.avatarUrl} />
                      <AvatarFallback>
                        {request.user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{request.user.username}</div>
                      <div className="text-sm text-muted-foreground">
                        Requested{" "}
                        {formatDistanceToNow(new Date(request.requestedAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRequest(request.id, "accept")}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequest(request.id, "reject")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No pending follow requests
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
