import { EnvironmentConfigService } from "./EnvironmentConfigService";

interface UserMetrics {
  sessionDuration: number;
  completedLessons: number;
  averageScore: number;
  engagementLevel: "low" | "medium" | "high";
  lastActive: Date;
}

interface LessonMetrics {
  lessonId: string;
  viewCount: number;
  averageCompletionTime: number;
  dropoffPoints: number[];
  ratings: number[];
  difficulty: "easy" | "medium" | "hard";
}

interface FeedbackData {
  type: "lesson" | "tutorial" | "feature";
  targetId: string;
  rating: number;
  comment?: string;
  tags: string[];
  timestamp: Date;
}

interface AnalyticsEvent {
  eventType: string;
  userId: string;
  timestamp: Date;
  data: Record<string, any>;
  sessionId: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private config: EnvironmentConfigService;
  private eventQueue: AnalyticsEvent[] = [];
  private isProcessing: boolean = false;
  private sessionId: string;

  private constructor() {
    this.config = EnvironmentConfigService.getInstance();
    this.sessionId = this.generateSessionId();
    this.startEventProcessor();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async startEventProcessor() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (true) {
      if (this.eventQueue.length === 0) {
        this.isProcessing = false;
        break;
      }

      const batch = this.eventQueue.splice(0, 10);
      try {
        await this.sendEvents(batch);
      } catch (error) {
        console.error("Failed to send analytics events:", error);
        // Re-queue failed events
        this.eventQueue.unshift(...batch);
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before retrying
      }
    }
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    if (!this.config.isProduction()) {
      console.log("Analytics events:", events);
      return;
    }

    // In production, send to analytics service
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ events }),
    });
  }

  public trackEvent(
    eventType: string,
    data: Record<string, any>,
    userId: string,
  ): void {
    const event: AnalyticsEvent = {
      eventType,
      userId,
      timestamp: new Date(),
      data,
      sessionId: this.sessionId,
    };

    this.eventQueue.push(event);
    if (!this.isProcessing) {
      this.startEventProcessor();
    }
  }

  public async submitFeedback(
    feedback: Omit<FeedbackData, "timestamp">,
  ): Promise<void> {
    const feedbackData: FeedbackData = {
      ...feedback,
      timestamp: new Date(),
    };

    this.trackEvent("feedback_submitted", feedbackData, feedback.targetId);

    if (this.config.isProduction()) {
      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      });
    }
  }

  public async getUserMetrics(userId: string): Promise<UserMetrics> {
    const response = await fetch(`/api/analytics/users/${userId}/metrics`);
    return response.json();
  }

  public async getLessonMetrics(lessonId: string): Promise<LessonMetrics> {
    const response = await fetch(`/api/analytics/lessons/${lessonId}/metrics`);
    return response.json();
  }

  public trackLessonProgress(
    lessonId: string,
    userId: string,
    progress: number,
    timeSpent: number,
  ): void {
    this.trackEvent(
      "lesson_progress",
      {
        lessonId,
        progress,
        timeSpent,
      },
      userId,
    );
  }

  public trackFeatureUsage(
    featureId: string,
    userId: string,
    action: string,
    metadata?: Record<string, any>,
  ): void {
    this.trackEvent(
      "feature_usage",
      {
        featureId,
        action,
        ...metadata,
      },
      userId,
    );
  }

  public async getEngagementScore(userId: string): Promise<number> {
    const metrics = await this.getUserMetrics(userId);
    const weights = {
      sessionDuration: 0.3,
      completedLessons: 0.4,
      averageScore: 0.3,
    };

    return (
      metrics.sessionDuration * weights.sessionDuration +
      metrics.completedLessons * weights.completedLessons +
      metrics.averageScore * weights.averageScore
    );
  }

  public async generateInsights(
    lessonId: string,
  ): Promise<Record<string, any>> {
    const metrics = await this.getLessonMetrics(lessonId);

    return {
      difficulty: metrics.difficulty,
      averageCompletionTime: metrics.averageCompletionTime,
      dropoffPoints: metrics.dropoffPoints,
      recommendations: this.generateRecommendations(metrics),
    };
  }

  private generateRecommendations(metrics: LessonMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.averageCompletionTime > 45) {
      recommendations.push(
        "Consider breaking the lesson into smaller segments",
      );
    }

    if (metrics.dropoffPoints.length > 0) {
      recommendations.push("Review content at identified drop-off points");
    }

    if (metrics.ratings.length > 0) {
      const avgRating =
        metrics.ratings.reduce((a, b) => a + b) / metrics.ratings.length;
      if (avgRating < 3.5) {
        recommendations.push("Content may need revision based on user ratings");
      }
    }

    return recommendations;
  }
}
