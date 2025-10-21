import { api as axiosInstance } from "../api";
import { reportCache } from "../cache/report-cache";

const BASE_URL = "/api/reports";

export interface KPIDefinition {
  id: number;
  kpi_name: string;
  description: string | null;
  calculation_details: Record<string, any> | null;
  created_at: string;
}

export interface Report {
  id: number;
  report_name: string;
  report_parameters: Record<string, any> | null;
  created_at: string;
  is_public: boolean;
  shared_with: number[];
}

export interface ReportResult {
  id: number;
  report: number;
  generated_data: Record<string, any> | null;
  generated_at: string;
}

export interface ReportSchedule {
  id: number;
  report: number;
  schedule_cron: string;
  delivery_channels: Record<string, any> | null;
  active: boolean;
}

interface ReportOptions {
  userId?: string | null;
  next?: {
    revalidate: number | false;
  };
}

// API functions for KPI Definitions
export const kpiDefinitionsApi = {
  list: () =>
    axiosInstance.get<KPIDefinition[]>(`${BASE_URL}/kpi-definitions/`),
  create: (data: Partial<KPIDefinition>) =>
    axiosInstance.post<KPIDefinition>(`${BASE_URL}/kpi-definitions/`, data),
  get: (id: number) =>
    axiosInstance.get<KPIDefinition>(`${BASE_URL}/kpi-definitions/${id}/`),
  update: (id: number, data: Partial<KPIDefinition>) =>
    axiosInstance.put<KPIDefinition>(
      `${BASE_URL}/kpi-definitions/${id}/`,
      data,
    ),
  delete: (id: number) =>
    axiosInstance.delete(`${BASE_URL}/kpi-definitions/${id}/`),
};

// API functions for Reports
export const reportsApi = {
  list: () => axiosInstance.get<Report[]>(`${BASE_URL}/reports/`),
  create: (data: Partial<Report>) =>
    axiosInstance.post<Report>(`${BASE_URL}/reports/`, data),
  get: (id: number) => axiosInstance.get<Report>(`${BASE_URL}/reports/${id}/`),
  update: (id: number, data: Partial<Report>) =>
    axiosInstance.put<Report>(`${BASE_URL}/reports/${id}/`, data),
  delete: (id: number) => axiosInstance.delete(`${BASE_URL}/reports/${id}/`),
  share: (id: number, userIds: number[]) =>
    axiosInstance.post(`${BASE_URL}/reports/${id}/share/`, { users: userIds }),
  getReportData: async (type: string, options: ReportOptions = {}) => {
    const { userId, next } = options;
    const cacheKey = `reports:${type}:${userId || "anonymous"}`;

    // Check cache first
    const cachedData = await reportCache.get(cacheKey);
    if (cachedData && !next?.revalidate) {
      return cachedData;
    }

    // Fetch fresh data
    const response = await axiosInstance.get(`${BASE_URL}/${type}`, {
      headers: {
        ...(userId && { "x-user-id": userId }),
      },
      params: next,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch report: ${response.statusText}`);
    }

    const data = response.data;

    // Cache the response if appropriate
    if (next?.revalidate !== false) {
      await reportCache.set(cacheKey, data, next?.revalidate || 300);
    }

    return data;
  },
  getDashboardMetrics: async (options: ReportOptions = {}) => {
    const { userId } = options;

    const requests = [
      reportsApi.getReportData("user-metrics", {
        userId,
        next: { revalidate: 300 },
      }),
      reportsApi.getReportData("revenue-metrics", {
        userId,
        next: { revalidate: 900 },
      }),
      reportsApi.getReportData("content-metrics", {
        userId,
        next: { revalidate: 600 },
      }),
    ];

    const [userMetrics, revenueMetrics, contentMetrics] =
      await Promise.all(requests);

    return {
      userMetrics,
      revenueMetrics,
      contentMetrics,
    };
  },
  getPrecomputedMetrics: async (type: string, options: ReportOptions = {}) => {
    const { userId } = options;
    const cacheKey = `metrics:${type}:${userId || "anonymous"}`;

    // Check cache first
    const cachedData = await reportCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Fetch fresh data
    const response = await axiosInstance.get(`${BASE_URL}/metrics/compute/`, {
      params: { type },
      headers: {
        ...(userId && { "x-user-id": userId }),
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }

    const data = response.data;

    // Cache the response
    await reportCache.set(cacheKey, data, 300); // Cache for 5 minutes

    return data;
  },
  getRealTimeMetrics: async (type: string, options: ReportOptions = {}) => {
    const { userId } = options;

    const response = await axiosInstance.get(`${BASE_URL}/metrics/realtime/`, {
      params: { type },
      headers: {
        ...(userId && { "x-user-id": userId }),
      },
    });

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch real-time metrics: ${response.statusText}`,
      );
    }

    return response.data;
  },
};

// Export getReportData function separately for direct import in report pages
export const getReportData = async (type: string, options: ReportOptions = {}) => {
  return reportsApi.getReportData(type, options);
};

// API functions for Report Results
export const reportResultsApi = {
  list: () => axiosInstance.get<ReportResult[]>(`${BASE_URL}/report-results/`),
  create: (data: Partial<ReportResult>) =>
    axiosInstance.post<ReportResult>(`${BASE_URL}/report-results/`, data),
  get: (id: number) =>
    axiosInstance.get<ReportResult>(`${BASE_URL}/report-results/${id}/`),
  update: (id: number, data: Partial<ReportResult>) =>
    axiosInstance.put<ReportResult>(`${BASE_URL}/report-results/${id}/`, data),
  delete: (id: number) =>
    axiosInstance.delete(`${BASE_URL}/report-results/${id}/`),
};

// API functions for Report Schedules
export const reportSchedulesApi = {
  list: () =>
    axiosInstance.get<ReportSchedule[]>(`${BASE_URL}/report-schedules/`),
  create: (data: Partial<ReportSchedule>) =>
    axiosInstance.post<ReportSchedule>(`${BASE_URL}/report-schedules/`, data),
  get: (id: number) =>
    axiosInstance.get<ReportSchedule>(`${BASE_URL}/report-schedules/${id}/`),
  update: (id: number, data: Partial<ReportSchedule>) =>
    axiosInstance.put<ReportSchedule>(
      `${BASE_URL}/report-schedules/${id}/`,
      data,
    ),
  delete: (id: number) =>
    axiosInstance.delete(`${BASE_URL}/report-schedules/${id}/`),
  activate: (id: number) =>
    axiosInstance.post(`${BASE_URL}/report-schedules/${id}/activate/`),
  deactivate: (id: number) =>
    axiosInstance.post(`${BASE_URL}/report-schedules/${id}/deactivate/`),
  toggleActive: (id: number) =>
    axiosInstance.post(`${BASE_URL}/report-schedules/${id}/toggle-active/`),
};
