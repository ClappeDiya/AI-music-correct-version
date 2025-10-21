/**
 * Types for report data structures
 */

export interface ReportData {
  id: string;
  name: string;
  generatedAt: string; // ISO date string
  type: ReportType;
  status: ReportStatus;
  summary?: string;
  createdBy?: string;
  downloadUrl?: string;
  detailsUrl?: string;
}

export type ReportType = 'user-activity' | 'content-performance' | 'financial' | 'analytics' | 'custom';

export type ReportStatus = 'completed' | 'pending' | 'failed';

export interface ReportSummary {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  recentReports: ReportData[];
}
