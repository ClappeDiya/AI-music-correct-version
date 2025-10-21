"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { User } from "lucide-react";
import { User as UserType } from "@/types/user";

interface UserListProps {
  participants: any[];
  onParticipantsChange: (participants: any[]) => void;
}

export function UserList({
  participants,
  onParticipantsChange,
}: UserListProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      avatar?: string;
    }>
  >([]);

  const handleAddUser = (user: any) => {
    if (!participants.some((p) => p.id === user.id)) {
      onParticipantsChange([...participants, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    onParticipantsChange(participants.filter((p) => p.id !== userId));
  };

  // TODO: Implement user search functionality
  // filteredUsers state is already declared

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="outline">Search</Button>
      </div>

      <ScrollArea className="h-64 rounded-md border p-4">
        <div className="space-y-2">
          {participants.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Badge
                variant="destructive"
                className="cursor-pointer"
                onClick={() => handleRemoveUser(user.id)}
              >
                Remove
              </Badge>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Search Results</h4>
        <ScrollArea className="h-48 rounded-md border p-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
              onClick={() => handleAddUser(user)}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Add
              </Button>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}

export function useUserList() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}
