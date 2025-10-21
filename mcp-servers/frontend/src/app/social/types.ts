export interface User {
  id: string;
  name: string;
  avatar: string;
}

import { z } from "zod";

export const postSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(500, "Content must be less than 500 characters"),
  visibility: z.enum(["public", "followers", "private"]),
  trackUrl: z.string().url("Invalid track URL").optional(),
});

export type PostFormValues = z.infer<typeof postSchema>;

export interface Post {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  shares: number;
  visibility: "public" | "followers" | "private";
  trackId?: string;
  trackUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  id: string;
  user: User;
  postId: string;
  createdAt: string;
}
