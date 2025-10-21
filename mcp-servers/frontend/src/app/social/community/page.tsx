"use client";

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Music, 
  MessageCircle, 
  Bell, 
  UserPlus, 
  Calendar,
  ThumbsUp,
  MessageSquare,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/useToast';

// Define mock data for community page
interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    username: string;
  };
  content: string;
  trackTitle?: string;
  trackUrl?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

// This would come from an API in a real app
const mockPosts: CommunityPost[] = [
  {
    id: '1',
    author: {
      name: 'Emma Wilson',
      username: 'emma_music',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    content: 'Just finished my new track "Midnight Dreams" using the mood-based generator. Check it out and let me know what you think!',
    trackTitle: 'Midnight Dreams',
    trackUrl: '#',
    likes: 24,
    comments: 5,
    timestamp: '2023-03-10T14:30:00'
  },
  {
    id: '2',
    author: {
      name: 'James Rodriguez',
      username: 'jrod_beats',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    content: 'Looking for collaborators on a new electronic project. Anyone interested in adding vocals or synth layers?',
    likes: 12,
    comments: 8,
    timestamp: '2023-03-09T18:45:00'
  },
  {
    id: '3',
    author: {
      name: 'Sophia Chen',
      username: 'sophia_sounds',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    content: 'The new AI DJ feature is amazing! Created a full 30-minute mix for my workout session.',
    trackTitle: 'Energetic Workout Mix',
    trackUrl: '#',
    likes: 45,
    comments: 12,
    timestamp: '2023-03-08T10:15:00'
  }
];

// Mock events data
const upcomingEvents = [
  {
    id: '1',
    title: 'Beat-Making Challenge',
    date: '2023-03-15',
    time: '19:00',
    participants: 48
  },
  {
    id: '2',
    title: 'Producer Meetup',
    date: '2023-03-18',
    time: '14:00',
    participants: 32
  },
  {
    id: '3',
    title: 'Live Feedback Session',
    date: '2023-03-22',
    time: '20:00',
    participants: 24
  }
];

// Mock active users
const activeUsers = [
  { name: 'Emma Wilson', username: 'emma_music', avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: 'James Rodriguez', username: 'jrod_beats', avatar: 'https://i.pravatar.cc/150?img=2' },
  { name: 'Sophia Chen', username: 'sophia_sounds', avatar: 'https://i.pravatar.cc/150?img=3' },
  { name: 'Michael Jones', username: 'mike_tunes', avatar: 'https://i.pravatar.cc/150?img=4' },
  { name: 'Olivia Taylor', username: 'olivia_beats', avatar: 'https://i.pravatar.cc/150?img=5' }
];

export default function SocialCommunityPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postContent, setPostContent] = useState('');
  
  // Load mock posts on component mount
  useEffect(() => {
    setPosts(mockPosts);
  }, []);
  
  // Handle creating a new post
  const handleCreatePost = () => {
    if (postContent.trim() === '') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Post content cannot be empty.",
      });
      return;
    }
    
    // Create new post
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: {
        name: 'Current User',
        username: 'current_user',
      },
      content: postContent,
      likes: 0,
      comments: 0,
      timestamp: new Date().toISOString()
    };
    
    // Add post to list
    setPosts([newPost, ...posts]);
    setPostContent('');
    
    toast({
      title: "Success",
      description: "Your post has been published.",
    });
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Social Community</h1>
          <p className="text-muted-foreground">Connect with musicians, share your work, and collaborate</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Find Friends
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Post creation card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Create Post</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input
                      placeholder="Share something with the community..."
                      className="min-h-[100px]"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Music className="h-4 w-4 mr-2" />
                    Attach Track
                  </Button>
                  <Button onClick={handleCreatePost}>
                    Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Posts feed */}
          <Tabs defaultValue="latest" className="space-y-4">
            <TabsList>
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
            
            <TabsContent value="latest" className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{post.author.name}</CardTitle>
                          <CardDescription>@{post.author.username}</CardDescription>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(post.timestamp)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3">{post.content}</p>
                    {post.trackTitle && (
                      <div className="border rounded-md p-3 flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Music className="h-5 w-5 text-primary" />
                          <span>{post.trackTitle}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Play
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <div className="flex gap-4">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="trending">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Trending posts will appear here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="following">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Posts from people you follow will appear here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {event.date} • {event.time}
                    </p>
                  </div>
                  <Badge>{event.participants} joined</Badge>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Events
              </Button>
            </CardFooter>
          </Card>
          
          {/* Active community members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Active Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.username}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Find More Friends
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 