import { ApiError } from "@/lib/api-client";
import { musicEducationAuthClient } from "./auth-client";

const apiClient = musicEducationAuthClient;
const BASE_URL = "v1/music-education";

// Error handling function
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  if (error instanceof ApiError) {
    throw error;
  }
  throw new Error("An unexpected error occurred");
};

// Types
export interface Educator {
  id: number;
  name: string;
  bio?: string;
  specialization: string;
  created_at: string;
}

export interface Course {
  id: number;
  course_name: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Lesson {
  id: number;
  course: number;
  lesson_title: string;
  content?: Record<string, any>;
  order_in_course: number;
  created_at: string;
}

export interface LearningPath {
  id: number;
  path_name: string;
  description?: string;
  structure?: Record<string, any>;
  created_at: string;
}

export interface MentoringSession {
  id: number;
  user: number;
  educator: number;
  session_data: {
    scheduled_time: string;
    topics: string[];
    notes?: string;
  };
  created_at: string;
}

export interface Achievement {
  id: number;
  name: string;
  description?: string;
  criteria: Record<string, any>;
  created_at: string;
}

export interface UserAchievement {
  id: number;
  user: number;
  achievement: number;
  earned_at: string;
}

export interface PerformanceRecording {
  id: number;
  user: number;
  lesson?: number;
  file_url: string;
  submitted_at: string;
}

export interface PerformanceAnalysis {
  id: number;
  recording: number;
  analysis_data: {
    transcription?: string;
    pitch_accuracy?: number;
    timing_variance?: number;
    feedback?: string;
  };
  created_at: string;
}

// Video Notes
interface VideoNote {
  id: number;
  lesson: number;
  timestamp: number;
  text: string;
  created_at: string;
}

interface WatchHistory {
  id: number;
  lesson: number;
  section: number;
  progress: number;
  timestamp: string;
  last_position: number;
}

interface VideoAnalytics {
  id: number;
  lesson: number;
  total_watch_time: number;
  completion_rate: number;
  average_engagement: number;
  most_watched_segments: Array<{
    start: number;
    end: number;
    count: number;
  }>;
  updated_at: string;
}

interface RetentionPoint {
  time: number;
  viewers: number;
}

// Additional Types
export interface PeerTutoringMatch {
  id: number;
  tutor: number;
  tutee: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  topic: string;
  description: string;
  skillLevel: string;
  preferredTime: string;
}

export interface PeerTutoringRequest {
  id: number;
  user: number;
  instrument: string;
  skill_level: string;
  topics: string[];
  availability: string[];
  created_at: string;
  topic: string;
  description: string;
  skillLevel: string;
  preferredTime: string;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  questions: Array<{
    id: number;
    text: string;
    options: string[];
    correct_option: number;
  }>;
  created_at: string;
}

export interface SessionAnalytics {
  overview: {
    totalSessions: number;
    completedSessions: number;
    averageRating: number;
    totalHours: number;
    activeUsers: number;
  };
  mentoring: {
    totalMentors: number;
    averageMentorRating: number;
    popularTopics: Array<{ topic: string; count: number }>;
    sessionsByMonth: Array<{ month: string; sessions: number }>;
    completionRate: number;
  };
  peerTutoring: {
    totalPeers: number;
    averagePeerRating: number;
    matchRate: number;
    activeGroups: number;
    topSkillLevels: Array<{ level: string; count: number }>;
  };
  recentActivity: Array<{
    id: string;
    type: "mentoring" | "peer";
    title: string;
    date: string;
    status: string;
    rating?: number;
  }>;
}

// API Functions
export const musicEducationApi = {
  // Educators
  getEducators: async (): Promise<Educator[]> => {
    try {
      return await apiClient.get(`${BASE_URL}/educators/`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getEducator: async (id: number): Promise<Educator> => {
    try {
      return await apiClient.get(`${BASE_URL}/educators/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  createEducator: async (data: Partial<Educator>): Promise<Educator> => {
    try {
      return await apiClient.post(`${BASE_URL}/educators`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateEducator: async (id: number, data: Partial<Educator>): Promise<Educator> => {
    try {
      return await apiClient.put(`${BASE_URL}/educators/${id}`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteEducator: async (id: number): Promise<void> => {
    try {
      return await apiClient.delete(`${BASE_URL}/educators/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Session Analytics
  getSessionAnalytics: async (timeframe: string): Promise<SessionAnalytics> => {
    try {
      return await apiClient.get(`${BASE_URL}/session-analytics`, { params: { timeframe } });
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Peer Tutoring
  getPeerTutoringMatches: async (): Promise<PeerTutoringMatch[]> => {
    try {
      return await apiClient.get(`${BASE_URL}/peer-tutoring/matches`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  createPeerTutoringRequest: async (data: Partial<PeerTutoringRequest>): Promise<PeerTutoringRequest> => {
    try {
      return await apiClient.post(`${BASE_URL}/peer-tutoring/requests`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  acceptPeerTutoringMatch: async (id: number): Promise<PeerTutoringMatch> => {
    try {
      return await apiClient.put(`${BASE_URL}/peer-tutoring/matches/${id}/accept`, {});
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Quizzes
  getQuizzes: async (): Promise<Quiz[]> => {
    try {
      return await apiClient.get(`${BASE_URL}/quizzes`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getQuiz: async (id: number): Promise<Quiz> => {
    try {
      return await apiClient.get(`${BASE_URL}/quizzes/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  createQuiz: async (data: Partial<Quiz>): Promise<Quiz> => {
    try {
      return await apiClient.post(`${BASE_URL}/quizzes`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateQuiz: async (id: number, data: Partial<Quiz>): Promise<Quiz> => {
    try {
      return await apiClient.put(`${BASE_URL}/quizzes/${id}`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteQuiz: async (id: number): Promise<void> => {
    try {
      return await apiClient.delete(`${BASE_URL}/quizzes/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Courses
  getCourses: async (): Promise<Course[]> => {
    try {
      return await apiClient.get(`${BASE_URL}/courses`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getCourse: async (id: number): Promise<Course> => {
    try {
      return await apiClient.get(`${BASE_URL}/courses/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  createCourse: async (data: Partial<Course>): Promise<Course> => {
    try {
      return await apiClient.post(`${BASE_URL}/courses`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateCourse: async (id: number, data: Partial<Course>): Promise<Course> => {
    try {
      return await apiClient.put(`${BASE_URL}/courses/${id}`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteCourse: async (id: number): Promise<void> => {
    try {
      return await apiClient.delete(`${BASE_URL}/courses/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  checkEnrollment: async (id: number): Promise<{ enrolled: boolean }> => {
    try {
      return await apiClient.get(`${BASE_URL}/courses/${id}/is-user-enrolled`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Lessons
  getLessons: async (): Promise<Lesson[]> => {
    try {
      return await apiClient.get(`${BASE_URL}/lessons`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getLesson: async (id: number): Promise<Lesson> => {
    try {
      return await apiClient.get(`${BASE_URL}/lessons/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  createLesson: async (data: Partial<Lesson>): Promise<Lesson> => {
    try {
      return await apiClient.post(`${BASE_URL}/lessons`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateLesson: async (id: number, data: Partial<Lesson>): Promise<Lesson> => {
    try {
      return await apiClient.put(`${BASE_URL}/lessons/${id}`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteLesson: async (id: number): Promise<void> => {
    try {
      return await apiClient.delete(`${BASE_URL}/lessons/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  checkLessonAccess: async (id: number): Promise<{ accessible: boolean }> => {
    try {
      return await apiClient.get(`${BASE_URL}/lessons/${id}/is-accessible-to-user`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Learning Paths
  getLearningPaths: async (): Promise<LearningPath[]> => {
    try {
      return await apiClient.get(`${BASE_URL}/learning-paths`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getLearningPath: async (id: number): Promise<LearningPath> => {
    try {
      return await apiClient.get(`${BASE_URL}/learning-paths/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  createLearningPath: async (data: Partial<LearningPath>): Promise<LearningPath> => {
    try {
      return await apiClient.post(`${BASE_URL}/learning-paths`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateLearningPath: async (id: number, data: Partial<LearningPath>): Promise<LearningPath> => {
    try {
      return await apiClient.put(`${BASE_URL}/learning-paths/${id}`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteLearningPath: async (id: number): Promise<void> => {
    try {
      return await apiClient.delete(`${BASE_URL}/learning-paths/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Mentoring Sessions
  getMentoringSessions: async (): Promise<MentoringSession[]> => {
    try {
      return await apiClient.get(`${BASE_URL}/mentoring-sessions`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getMentoringSession: async (id: number): Promise<MentoringSession> => {
    try {
      return await apiClient.get(`${BASE_URL}/mentoring-sessions/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  createMentoringSession: async (data: Partial<MentoringSession>): Promise<MentoringSession> => {
    try {
      return await apiClient.post(`${BASE_URL}/mentoring-sessions`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateMentoringSession: async (id: number, data: Partial<MentoringSession>): Promise<MentoringSession> => {
    try {
      return await apiClient.put(`${BASE_URL}/mentoring-sessions/${id}`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteMentoringSession: async (id: number): Promise<void> => {
    try {
      return await apiClient.delete(`${BASE_URL}/mentoring-sessions/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Achievements
  getAchievements: async (): Promise<Achievement[]> => {
    try {
      return await apiClient.get(`${BASE_URL}/achievements`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getAchievement: async (id: number): Promise<Achievement> => {
    try {
      return await apiClient.get(`${BASE_URL}/achievements/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getUserAchievements: async (): Promise<UserAchievement[]> => {
    try {
      return await apiClient.get(`${BASE_URL}/user-achievements`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Performance
  getPerformanceRecordings: async (): Promise<PerformanceRecording[]> => {
    try {
      return await apiClient.get(`${BASE_URL}/performance-recordings`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getPerformanceRecording: async (id: number): Promise<PerformanceRecording> => {
    try {
      return await apiClient.get(`${BASE_URL}/performance-recordings/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  createPerformanceRecording: async (data: FormData): Promise<PerformanceRecording> => {
    try {
      return await apiClient.post(`${BASE_URL}/performance-recordings`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  deletePerformanceRecording: async (id: number): Promise<void> => {
    try {
      return await apiClient.delete(`${BASE_URL}/performance-recordings/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getPerformanceAnalysis: async (recordingId: number): Promise<PerformanceAnalysis> => {
    try {
      return await apiClient.get(`${BASE_URL}/performance-analysis/${recordingId}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Video Notes
  getNotes: async (lessonId: number): Promise<VideoNote[]> => {
    try {
      return await apiClient.get(`${BASE_URL}/video-notes`, { params: { lesson: lessonId } });
    } catch (error) {
      return handleApiError(error);
    }
  },
  createNote: async (data: Omit<VideoNote, "id" | "created_at">): Promise<VideoNote> => {
    try {
      return await apiClient.post(`${BASE_URL}/video-notes`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateNote: async (id: number, data: Partial<VideoNote>): Promise<VideoNote> => {
    try {
      return await apiClient.patch(`${BASE_URL}/video-notes/${id}`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteNote: async (id: number): Promise<void> => {
    try {
      return await apiClient.delete(`${BASE_URL}/video-notes/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Watch History
  getWatchHistory: async (lessonId: number): Promise<WatchHistory[]> => {
    try {
      return await apiClient.get(`${BASE_URL}/watch-history`, { params: { lesson: lessonId } });
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateWatchHistory: async (data: Omit<WatchHistory, "id">): Promise<WatchHistory> => {
    try {
      return await apiClient.post(`${BASE_URL}/watch-history`, data);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getUserProgress: async (): Promise<Array<{ lesson: number; max_progress: number }>> => {
    try {
      return await apiClient.get(`${BASE_URL}/watch-history/user-progress`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Video Analytics
  getVideoAnalytics: async (lessonId: number): Promise<VideoAnalytics> => {
    try {
      return await apiClient.get(`${BASE_URL}/video-analytics`, { params: { lesson: lessonId } });
    } catch (error) {
      return handleApiError(error);
    }
  },
  getEngagementMetrics: async (analyticsId: number): Promise<{
    total_sessions: number;
    average_session_duration: number;
    completion_rate: number;
    average_engagement: number;
    most_watched_segments: VideoAnalytics["most_watched_segments"];
  }> => {
    try {
      return await apiClient.get(`${BASE_URL}/video-analytics/${analyticsId}/engagement-metrics`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getRetentionCurve: async (analyticsId: number): Promise<RetentionPoint[]> => {
    try {
      return await apiClient.get(`${BASE_URL}/video-analytics/${analyticsId}/retention-curve`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateVideoAnalytics: async (data: {
    lessonId: number;
    event: "play" | "pause" | "seek" | "complete";
    timestamp: number;
    duration?: number;
  }): Promise<VideoAnalytics> => {
    try {
      return await apiClient.post(`${BASE_URL}/video-analytics`, {
        lesson: data.lessonId,
        event_type: data.event,
        timestamp: data.timestamp,
        duration: data.duration,
      });
    } catch (error) {
      return handleApiError(error);
    }
  },
};
