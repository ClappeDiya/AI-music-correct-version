"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext, createContext, type ReactNode } from "react";
import { useAuth } from "./use-auth";
import api from "../api";

// ... rest of the interfaces ...

export const FeatureFlagContext = createContext<{
  getFeatureState: (key: string) => Promise<FeatureState>;
  recordMetric: (
    key: string,
    success: boolean,
    latency: number,
  ) => Promise<void>;
} | null>(null);

interface FeatureFlagProviderProps {
  children: ReactNode;
}

export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getFeatureState = useCallback(
    async (key: string) => {
      const context: FeatureContext = {
        user_id: user?.id,
        user_groups: user?.groups,
        region: navigator.language,
        device_type: /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(
          navigator.userAgent,
        )
          ? "mobile"
          : "desktop",
      };

      const start = performance.now();
      try {
        const response = await api.post(`/api/feature_flags/${key}/evaluate`, {
          context,
        });
        const latency = performance.now() - start;

        // Record metrics asynchronously
        api
          .post(`/api/feature_flags/${key}/metrics`, {
            success: true,
            latency_ms: latency,
            context,
          })
          .catch(console.error);

        return response.data;
      } catch (error) {
        const latency = performance.now() - start;

        // Record error metrics
        api
          .post(`/api/feature_flags/${key}/metrics`, {
            success: false,
            latency_ms: latency,
            context,
          })
          .catch(console.error);

        return { isEnabled: false, reason: "error" };
      }
    },
    [user],
  );

  const recordMetric = useCallback(
    async (key: string, success: boolean, latency: number) => {
      await api.post(`/api/feature_flags/${key}/metrics`, {
        success,
        latency_ms: latency,
        context: {
          user_id: user?.id,
          user_groups: user?.groups,
        },
      });
    },
    [user],
  );

  return (
    <FeatureFlagContext.Provider value={{ getFeatureState, recordMetric }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

// ... rest of the hooks ...
