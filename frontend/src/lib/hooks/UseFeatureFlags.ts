import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext, createContext, type ReactNode } from 'react';
import { useAuth } from './use-auth';
import { api } from '../api';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'scheduled' | 'archived';
  percentage_rollout: number;
  user_segments: string[];
  geographic_regions: string[];
  device_types: string[];
  start_date?: string;
  end_date?: string;
  rules: Record<string, any>;
  is_monitored: boolean;
  alert_threshold?: number;
}

export interface FeatureContext {
  user_id?: string;
  user_groups?: string[];
  region?: string;
  device_type?: string;
  [key: string]: any;
}

interface FeatureState {
  isEnabled: boolean;
  reason?: string;
}

interface FeatureMetrics {
  impressions: number;
  activations: number;
  errors: number;
  error_rate: number;
  activation_rate: number;
  avg_latency_ms: number;
}

export const FeatureFlagContext = createContext<{
  getFeatureState: (key: string) => Promise<FeatureState>;
  recordMetric: (key: string, success: boolean, latency: number) => Promise<void>;
} | null>(null);

interface FeatureFlagProviderProps {
  children: ReactNode;
}

export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getFeatureState = useCallback(async (key: string) => {
    const context: FeatureContext = {
      user_id: user?.id,
      user_groups: user?.groups,
      region: navigator.language,
      device_type: /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
    };

    const start = performance.now();
    try {
      const response = await api.post(`/api/feature_flags/${key}/evaluate`, { context });
      const latency = performance.now() - start;
      
      // Record metrics asynchronously
      api.post(`/api/feature_flags/${key}/metrics`, {
        success: true,
        latency_ms: latency,
        context,
      }).catch(console.error);

      return response.data;
    } catch (error) {
      const latency = performance.now() - start;
      
      // Record error metrics
      api.post(`/api/feature_flags/${key}/metrics`, {
        success: false,
        latency_ms: latency,
        context,
      }).catch(console.error);

      return { isEnabled: false, reason: 'error' };
    }
  }, [user]);

  const recordMetric = useCallback(async (key: string, success: boolean, latency: number) => {
    await api.post(`/api/feature_flags/${key}/metrics`, {
      success,
      latency_ms: latency,
      context: {
        user_id: user?.id,
        user_groups: user?.groups,
      },
    });
  }, [user]);

  return (
    <FeatureFlagContext.Provider value={{ getFeatureState, recordMetric }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlag(key: string) {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  }

  const { data: state, isLoading } = useQuery(
    ['feature-flag', key],
    () => context.getFeatureState(key),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  return {
    isEnabled: state?.isEnabled ?? false,
    reason: state?.reason,
    isLoading,
  };
}

export function useFeatureFlagAdmin() {
  const queryClient = useQueryClient();

  const { data: flags, isLoading } = useQuery<FeatureFlag[]>(
    ['feature_flags'],
    () => api.get('/api/feature_flags').then(res => res.data)
  );

  const createFlag = useMutation(
    (flag: Partial<FeatureFlag>) => api.post('/api/feature_flags', flag),
    {
      onSuccess: () => queryClient.invalidateQueries(['feature_flags']),
    }
  );

  const updateFlag = useMutation(
    ({ key, flag }: { key: string; flag: Partial<FeatureFlag> }) =>
      api.put(`/api/feature_flags/${key}`, flag),
    {
      onSuccess: () => queryClient.invalidateQueries(['feature_flags']),
    }
  );

  const deleteFlag = useMutation(
    (key: string) => api.delete(`/api/feature_flags/${key}`),
    {
      onSuccess: () => queryClient.invalidateQueries(['feature_flags']),
    }
  );

  const getMetrics = useCallback(async (key: string, startDate: Date, endDate: Date) => {
    const response = await api.get<FeatureMetrics>(`/api/feature_flags/${key}/metrics`, {
      params: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });
    return response.data;
  }, []);

  return {
    flags,
    isLoading,
    createFlag,
    updateFlag,
    deleteFlag,
    getMetrics,
  };
}

export function useFeatureMetrics(key: string) {
  const { data: metrics, isLoading } = useQuery<FeatureMetrics>(
    ['feature-metrics', key],
    () => api.get(`/api/feature_flags/${key}/metrics`).then(res => res.data),
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  return {
    metrics,
    isLoading,
  };
}
