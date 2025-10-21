export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  genres: string[];
  similarityScore?: number;
  lastInteraction?: string;
}

export interface Recommendation {
  user: User;
  reason: string;
  timestamp: string;
}

export interface RecommendationHistory {
  user: User;
  action: "follow" | "unfollow" | "like" | "share";
  timestamp: string;
}
