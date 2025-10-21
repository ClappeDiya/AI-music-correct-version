'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/componen../ui/card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { FollowButton } from ./follow-button';

interface Following {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export function FollowingList() {
  const [following, setFollowing] = useState<Following[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await fetch('/api/social/following');
        if (!response.ok) throw new Error('Failed to fetch following list');
        const data = await response.json();
        setFollowing(data);
      } catch (error) {
        console.error('Error fetching following list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowing();
  }, []);

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    if (!isFollowing) {
      setFollowing(prev => prev.filter(user => user.id !== userId));
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading following list...</div>;
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <div className="p-4 space-y-4">
        {following.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{user.name}</h4>
                  {user.bio && (
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                  )}
                </div>
              </div>
              <FollowButton
                targetUserId={user.id}
                initialIsFollowing={true}
                onFollowChange={(isFollowing) => handleFollowChange(user.id, isFollowing)}
              />
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}



