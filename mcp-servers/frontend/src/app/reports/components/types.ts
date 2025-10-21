export interface ReportFilters {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  type: string;
  status: string;
  search: string;
}

export interface ReportType {
  id: string;
  label: string;
  value: string;
}

export interface ReportStatus {
  id: string;
  label: string;
  value: string;
}
