import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";

interface Post {
  id: string;
  author: {
    id: number;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  track_reference?: {
    id: number;
    title: string;
    url: string;
  };
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface SocialEvent {
  id: number;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  location: string;
  category: {
    id: number;
    name: string;
  };
  participants_count: number;
  is_virtual: boolean;
  image_url?: string;
  created_by: {
    id: number;
    name: string;
  };
}

interface User {
  id: number;
  name: string;
  username: string;
  avatar_url?: string;
  is_following?: boolean;
}

// Get posts for the community feed
export function usePosts(params: { page?: number; filter?: string } = {}) {
  return useQuery({
    queryKey: ["community-posts", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/social_community/posts/", {
        params,
      });
      return response.data;
    },
  });
}

// Create a new post
export function useCreatePost() {
  return useMutation({
    mutationFn: async (postData: { content: string; track_reference_id?: number }) => {
      const response = await api.post("/api/v1/social_community/posts/", postData);
      return response.data;
    },
  });
}

// Like a post
export function useLikePost() {
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.post(`/api/v1/social_community/post-likes/`, {
        post: postId,
      });
      return response.data;
    },
  });
}

// Comment on a post
export function useCommentOnPost() {
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await api.post(`/api/v1/social_community/post-comments/`, {
        post: postId,
        content,
      });
      return response.data;
    },
  });
}

// Get upcoming events
export function useUpcomingEvents() {
  return useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const response = await api.get("/api/v1/social_community/events/", {
        params: {
          upcoming: true,
          limit: 5,
        },
      });
      return response.data;
    },
  });
}

// Get active users
export function useActiveUsers() {
  return useQuery({
    queryKey: ["active-users"],
    queryFn: async () => {
      const response = await api.get("/api/v1/social_community/ephemeral-presences/", {
        params: {
          active: true,
          limit: 10,
        },
      });
      return response.data;
    },
  });
}

// Follow a user
export function useFollowUser() {
  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await api.post(`/api/v1/social_community/user-follows/`, {
        followed_user: userId,
      });
      return response.data;
    },
  });
}

// Join an event
export function useJoinEvent() {
  return useMutation({
    mutationFn: async (eventId: number) => {
      const response = await api.post(`/api/v1/social_community/event-participations/`, {
        event: eventId,
      });
      return response.data;
    },
  });
} 