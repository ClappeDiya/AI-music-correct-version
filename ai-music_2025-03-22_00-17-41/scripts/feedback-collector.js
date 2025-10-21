const {
  EnvironmentConfigService,
} = require("../src/services/EnvironmentConfigService");
const { AnalyticsService } = require("../src/services/analytics-service");
const { CacheManager } = require("./cache-manager");

class FeedbackCollector {
  constructor() {
    this.config = EnvironmentConfigService.getInstance();
    this.analytics = AnalyticsService.getInstance();
    this.cache = CacheManager.getInstance();
  }

  async submitFeedback(userId, feedbackData) {
    try {
      const feedback = {
        ...feedbackData,
        userId,
        timestamp: new Date().toISOString(),
        id: this.generateFeedbackId(),
      };

      // Validate feedback
      this.validateFeedback(feedback);

      // Store feedback
      await this.storeFeedback(feedback);

      // Track analytics
      this.analytics.trackEvent(
        "feedback_submitted",
        {
          feedbackId: feedback.id,
          type: feedback.type,
          targetId: feedback.targetId,
          rating: feedback.rating,
          hasComment: !!feedback.comment,
        },
        userId,
      );

      return feedback;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  }

  async collectUsageMetrics(userId, sessionData) {
    try {
      const metrics = {
        userId,
        sessionId: sessionData.sessionId,
        timestamp: new Date().toISOString(),
        metrics: this.calculateMetrics(sessionData),
      };

      // Store metrics
      await this.storeMetrics(metrics);

      // Update user engagement score
      await this.updateEngagementScore(userId, metrics);

      return metrics;
    } catch (error) {
      console.error("Error collecting usage metrics:", error);
      throw error;
    }
  }

  async getFeedbackSummary(targetId, options = {}) {
    try {
      const { timeframe = "30d", includeComments = true } = options;

      const feedback = await this.fetchFeedback(targetId, timeframe);

      return {
        targetId,
        timeframe,
        summary: this.summarizeFeedback(feedback),
        comments: includeComments ? this.extractComments(feedback) : [],
        sentiment: await this.analyzeSentiment(feedback),
      };
    } catch (error) {
      console.error("Error getting feedback summary:", error);
      throw error;
    }
  }

  async getUserEngagementReport(userId) {
    try {
      const metrics = await this.fetchUserMetrics(userId);
      const feedback = await this.fetchUserFeedback(userId);

      return {
        userId,
        engagementScore: await this.calculateEngagementScore(metrics),
        activitySummary: this.summarizeActivity(metrics),
        feedbackContribution: this.summarizeFeedbackContribution(feedback),
        recommendations: this.generateRecommendations(metrics, feedback),
      };
    } catch (error) {
      console.error("Error generating user engagement report:", error);
      throw error;
    }
  }

  validateFeedback(feedback) {
    const requiredFields = ["type", "targetId", "rating"];
    for (const field of requiredFields) {
      if (!feedback[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (
      typeof feedback.rating !== "number" ||
      feedback.rating < 1 ||
      feedback.rating > 5
    ) {
      throw new Error("Rating must be a number between 1 and 5");
    }

    if (feedback.comment && feedback.comment.length > 1000) {
      throw new Error("Comment must not exceed 1000 characters");
    }
  }

  calculateMetrics(sessionData) {
    return {
      duration: this.calculateDuration(
        sessionData.startTime,
        sessionData.endTime,
      ),
      completedItems: sessionData.completedItems || [],
      interactions: this.countInteractions(sessionData.events),
      progress: this.calculateProgress(sessionData),
      performance: this.calculatePerformance(sessionData),
    };
  }

  calculateDuration(startTime, endTime) {
    return (new Date(endTime) - new Date(startTime)) / 1000; // Duration in seconds
  }

  countInteractions(events) {
    if (!Array.isArray(events)) return 0;
    return events.length;
  }

  calculateProgress(sessionData) {
    const { totalItems, completedItems } = sessionData;
    if (!totalItems || totalItems === 0) return 0;
    return (completedItems.length / totalItems) * 100;
  }

  calculatePerformance(sessionData) {
    const { scores = [] } = sessionData;
    if (scores.length === 0) return null;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  summarizeFeedback(feedback) {
    const ratings = feedback.map((f) => f.rating);

    return {
      count: feedback.length,
      averageRating: this.calculateAverage(ratings),
      distribution: this.calculateDistribution(ratings),
      trend: this.calculateTrend(feedback),
    };
  }

  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateDistribution(ratings) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((rating) => distribution[rating]++);
    return distribution;
  }

  calculateTrend(feedback) {
    if (feedback.length < 2) return "stable";

    const sortedFeedback = [...feedback].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );

    const recentAvg = this.calculateAverage(
      sortedFeedback.slice(-10).map((f) => f.rating),
    );
    const previousAvg = this.calculateAverage(
      sortedFeedback.slice(-20, -10).map((f) => f.rating),
    );

    if (recentAvg > previousAvg + 0.5) return "improving";
    if (recentAvg < previousAvg - 0.5) return "declining";
    return "stable";
  }

  extractComments(feedback) {
    return feedback
      .filter((f) => f.comment)
      .map((f) => ({
        comment: f.comment,
        rating: f.rating,
        timestamp: f.timestamp,
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async analyzeSentiment(feedback) {
    const comments = feedback.filter((f) => f.comment).map((f) => f.comment);

    if (comments.length === 0) return null;

    // Implement sentiment analysis here
    // This is a placeholder implementation
    return {
      positive: 0.6,
      neutral: 0.3,
      negative: 0.1,
    };
  }

  summarizeActivity(metrics) {
    return {
      totalSessions: metrics.length,
      averageDuration: this.calculateAverage(
        metrics.map((m) => m.metrics.duration),
      ),
      completionRate: this.calculateCompletionRate(metrics),
      lastActive: this.getLastActiveTime(metrics),
    };
  }

  calculateCompletionRate(metrics) {
    const completed = metrics.reduce(
      (sum, m) => sum + m.metrics.completedItems.length,
      0,
    );
    const total = metrics.reduce((sum, m) => sum + m.metrics.totalItems, 0);
    return total > 0 ? (completed / total) * 100 : 0;
  }

  getLastActiveTime(metrics) {
    if (metrics.length === 0) return null;
    return metrics
      .map((m) => new Date(m.timestamp))
      .reduce((latest, current) => (current > latest ? current : latest))
      .toISOString();
  }

  summarizeFeedbackContribution(feedback) {
    return {
      totalFeedback: feedback.length,
      averageRating: this.calculateAverage(feedback.map((f) => f.rating)),
      commentRate: feedback.filter((f) => f.comment).length / feedback.length,
    };
  }

  generateRecommendations(metrics, feedback) {
    const recommendations = [];

    // Analyze engagement patterns
    const recentMetrics = metrics.slice(-5);
    const averageDuration = this.calculateAverage(
      recentMetrics.map((m) => m.metrics.duration),
    );

    if (averageDuration < 300) {
      // Less than 5 minutes
      recommendations.push("Consider shorter, more focused learning sessions");
    }

    // Analyze completion patterns
    const completionRate = this.calculateCompletionRate(recentMetrics);
    if (completionRate < 50) {
      recommendations.push(
        "Try breaking down lessons into smaller, manageable chunks",
      );
    }

    // Analyze feedback patterns
    if (feedback.length > 0) {
      const recentFeedback = feedback.slice(-5);
      const avgRating = this.calculateAverage(
        recentFeedback.map((f) => f.rating),
      );

      if (avgRating < 3) {
        recommendations.push(
          "Review difficulty levels and consider additional support resources",
        );
      }
    }

    return recommendations;
  }

  generateFeedbackId() {
    return `fb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Storage methods (to be implemented based on storage solution)
  async storeFeedback(feedback) {
    // Implementation depends on storage solution
    console.log("Storing feedback:", feedback.id);
  }

  async storeMetrics(metrics) {
    // Implementation depends on storage solution
    console.log("Storing metrics for session:", metrics.sessionId);
  }

  async fetchFeedback(targetId, timeframe) {
    // Implementation depends on storage solution
    console.log("Fetching feedback for:", targetId, timeframe);
    return [];
  }

  async fetchUserMetrics(userId) {
    // Implementation depends on storage solution
    console.log("Fetching metrics for user:", userId);
    return [];
  }

  async fetchUserFeedback(userId) {
    // Implementation depends on storage solution
    console.log("Fetching feedback from user:", userId);
    return [];
  }

  async updateEngagementScore(userId, metrics) {
    // Implementation depends on storage solution
    console.log("Updating engagement score for user:", userId);
  }

  async calculateEngagementScore(metrics) {
    // Implementation depends on scoring algorithm
    console.log("Calculating engagement score from metrics");
    return 0;
  }
}

// Export singleton instance
let instance = null;

function getInstance() {
  if (!instance) {
    instance = new FeedbackCollector();
  }
  return instance;
}

module.exports = {
  getInstance,
};
