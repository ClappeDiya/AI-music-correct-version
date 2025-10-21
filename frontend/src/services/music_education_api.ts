import { api } from "./api";

// Define types for achievement data
export interface Achievement {
  id: number;
  title: string;
  description: string;
  type: "milestone" | "skill" | "social" | "special";
  category: string;
  icon: string;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  requirements: string[];
  reward?: {
    type: string;
    value: string;
  };
}

// Music education API service
export const musicEducationApi = {
  // Get user achievements
  getUserAchievements: async () => {
    const response = await api.get("/api/music_education/achievements");
    return response.data as Achievement[];
  },

  // Get specific achievement by ID
  getAchievement: async (id: string) => {
    const response = await api.get(`/api/music_education/achievements/${id}`);
    return response.data as Achievement;
  },

  // Share achievement
  shareAchievement: async (achievementId: number) => {
    const response = await api.post(`/api/music_education/achievements/${achievementId}/share`);
    return response.data;
  },

  // Track progress for an achievement
  trackProgress: async (achievementId: number, progress: number) => {
    const response = await api.post(`/api/music_education/achievements/${achievementId}/progress`, {
      progress,
    });
    return response.data;
  },
};

export default musicEducationApi; 