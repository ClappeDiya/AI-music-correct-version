"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/componen../ui/card";
import { Badge } from "@/components/ui/Badge";
import { Users, Lock, Globe } from "lucide-react";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    category: string;
    privacy: "PUBLIC" | "PRIVATE";
    avatar?: string;
    isJoined: boolean;
  };
  onJoinLeave: (groupId: string, action: "join" | "leave") => Promise<void>;
}

export function GroupCard({ group, onJoinLeave }: GroupCardProps) {
  const handleJoinLeave = async () => {
    try {
      await onJoinLeave(group.id, group.isJoined ? "leave" : "join");
    } catch (error) {
      console.error("Failed to join/leave group:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={group.avatar} alt={group.name} />
          <AvatarFallback>{group.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">{group.name}</CardTitle>
            {group.privacy === "PRIVATE" ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <Badge variant="secondary" className="mt-1">
            {group.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm text-muted-foreground">
          {group.description}
        </CardDescription>
        <div className="mt-4 flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          {group.memberCount} members
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant={group.isJoined ? "outline" : "default"}
          className="w-full"
          onClick={handleJoinLeave}
        >
          {group.isJoined ? "Leave Group" : "Join Group"}
        </Button>
      </CardFooter>
    </Card>
  );
}
