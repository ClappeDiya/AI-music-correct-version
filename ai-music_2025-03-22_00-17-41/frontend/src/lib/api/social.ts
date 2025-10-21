import api from "../api";

export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
}

export const getFeed = async (): Promise<Post[]> => {
  const response = await api.get("/social/feed/");
  return response.data;
};

export const createPost = async (content: string): Promise<Post> => {
  const response = await api.post("/social/posts/", { content });
  return response.data;
};

export const likePost = async (postId: string): Promise<void> => {
  await api.post(`/social/posts/${postId}/like/`);
};

export const getPostComments = async (postId: string): Promise<Comment[]> => {
  const response = await api.get(`/social/posts/${postId}/comments/`);
  return response.data;
};

export const addComment = async (
  postId: string,
  content: string,
): Promise<Comment> => {
  const response = await api.post(`/social/posts/${postId}/comments/`, {
    content,
  });
  return response.data;
};

export const followUser = async (userId: string): Promise<void> => {
  await api.post(`/social/users/${userId}/follow/`);
};

export const getFollowers = async (userId: string): Promise<string[]> => {
  const response = await api.get(`/social/users/${userId}/followers/`);
  return response.data;
};

export const getFollowing = async (userId: string): Promise<string[]> => {
  const response = await api.get(`/social/users/${userId}/following/`);
  return response.data;
};
