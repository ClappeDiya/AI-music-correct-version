import { ApiClient } from "../../lib/api-client";
import {
  FeatureAnalytics,
  FeatureSurvey,
  SurveyResponse,
} from "../../types/api";

export class AnalyticsService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient();
  }

  // Feature Analytics
  async getFeatureAnalytics(filters?: {
    feature_category?: string;
    feature_name?: string;
    ordering?: string;
  }): Promise<FeatureAnalytics[]> {
    const params = new URLSearchParams();
    if (filters?.feature_category)
      params.append("feature_category", filters.feature_category);
    if (filters?.feature_name)
      params.append("feature_name", filters.feature_name);
    if (filters?.ordering) params.append("ordering", filters.ordering);

    return this.client.get<FeatureAnalytics[]>(
      `/feature-analytics/?${params.toString()}`,
    );
  }

  async getFeatureMetrics(featureId: string): Promise<any> {
    return this.client.get(`/feature-analytics/${featureId}/feature-metrics/`);
  }

  async logFeatureUsage(data: {
    feature_name: string;
    duration?: number;
    success?: boolean;
    metadata?: Record<string, any>;
  }): Promise<void> {
    return this.client.post("/log-feature-usage/", data);
  }

  // Survey Management
  async getSurveys(filters?: {
    feature_category?: string;
    is_active?: boolean;
  }): Promise<FeatureSurvey[]> {
    const params = new URLSearchParams();
    if (filters?.feature_category)
      params.append("feature_category", filters.feature_category);
    if (filters?.is_active !== undefined)
      params.append("is_active", String(filters.is_active));

    return this.client.get<FeatureSurvey[]>(
      `/feature-surveys/?${params.toString()}`,
    );
  }

  async getSurvey(id: string): Promise<FeatureSurvey> {
    return this.client.get<FeatureSurvey>(`/feature-surveys/${id}/`);
  }

  async createSurvey(data: Partial<FeatureSurvey>): Promise<FeatureSurvey> {
    return this.client.post<FeatureSurvey>("/feature-surveys/", data);
  }

  async updateSurvey(
    id: string,
    data: Partial<FeatureSurvey>,
  ): Promise<FeatureSurvey> {
    return this.client.patch<FeatureSurvey>(`/feature-surveys/${id}/`, data);
  }

  async deleteSurvey(id: string): Promise<void> {
    return this.client.delete(`/feature-surveys/${id}/`);
  }

  async toggleSurveyActive(id: string): Promise<FeatureSurvey> {
    return this.client.post<FeatureSurvey>(
      `/feature-surveys/${id}/toggle-active/`,
    );
  }

  // Survey Responses
  async getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
    return this.client.get<SurveyResponse[]>(
      `/survey-responses/?survey_id=${surveyId}`,
    );
  }

  async submitSurveyResponse(data: {
    survey_id: string;
    responses: Record<string, any>;
  }): Promise<SurveyResponse> {
    return this.client.post<SurveyResponse>("/survey-responses/", data);
  }

  async getSurveyResponseSummary(surveyId: string): Promise<any> {
    return this.client.get(`/survey-responses/summary/?survey_id=${surveyId}`);
  }

  // Analytics Dashboard Data
  async getAnalyticsDashboard(params?: {
    start_date?: string;
    end_date?: string;
    feature_categories?: string[];
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);
    if (params?.feature_categories) {
      params.feature_categories.forEach((category) => {
        queryParams.append("feature_categories", category);
      });
    }

    return this.client.get(
      `/feature-analytics/dashboard/?${queryParams.toString()}`,
    );
  }

  // User Feedback Analysis
  async getUserFeedbackTrends(params?: {
    start_date?: string;
    end_date?: string;
    feature_name?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);
    if (params?.feature_name)
      queryParams.append("feature_name", params.feature_name);

    return this.client.get(
      `/feature-analytics/feedback-trends/?${queryParams.toString()}`,
    );
  }

  // Feature Usage Heatmap
  async getFeatureUsageHeatmap(params?: {
    feature_name: string;
    time_resolution?: "hour" | "day" | "week";
    start_date?: string;
    end_date?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    queryParams.append("feature_name", params.feature_name);
    if (params?.time_resolution)
      queryParams.append("time_resolution", params.time_resolution);
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);

    return this.client.get(
      `/feature-analytics/usage-heatmap/?${queryParams.toString()}`,
    );
  }
}
