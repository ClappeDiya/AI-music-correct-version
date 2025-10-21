import { useState, useEffect } from 'react';
import { ReportFilters } from '@/app/reports/components/types';
import { ReportData } from '@/types/reports';

// Define base URL for API calls
const API_BASE_URL = '/api/reports';

/**
 * Hook to fetch reports based on filters
 */
export function useReports(filters: ReportFilters) {
  const [data, setData] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('startDate', filters.dateRange.startDate.toISOString());
        queryParams.append('endDate', filters.dateRange.endDate.toISOString());
        
        if (filters.type !== 'all') {
          queryParams.append('type', filters.type);
        }
        
        if (filters.status !== 'all') {
          queryParams.append('status', filters.status);
        }
        
        if (filters.search) {
          queryParams.append('search', filters.search);
        }

        // Fetch data from the API
        const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err);
        console.error('Error fetching reports:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [filters]);

  return { data, isLoading, error };
}

/**
 * Download a report by ID
 */
export async function downloadReport(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/download`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  } catch (error) {
    console.error('Error downloading report:', error);
    return { success: false, error };
  }
}
