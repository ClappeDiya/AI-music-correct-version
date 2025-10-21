import { useQuery } from "@tanstack/react-query";

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions?: {
    userGroups?: string[];
    percentage?: number;
    startDate?: string;
    endDate?: string;
    regions?: string[];
  };
}

export interface PricingConfig {
  dynamicPricing: {
    enabled: boolean;
    algorithm: "demand" | "time" | "hybrid";
    updateFrequency: number;
    maxAdjustmentPercentage: number;
  };
  subscriptionModel: {
    enabled: boolean;
    tiers: Array<{
      id: string;
      name: string;
      price: number;
      features: string[];
      downloadLimit: number;
      storageLimitGB: number;
    }>;
  };
  bundling: {
    enabled: boolean;
    minimumTracks: number;
    maximumTracks: number;
    discountPercentage: number;
  };
}

export interface PerformanceConfig {
  caching: {
    enabled: boolean;
    ttl: number;
    strategies: {
      browser: boolean;
      cdn: boolean;
      server: boolean;
    };
  };
  cdn: {
    enabled: boolean;
    provider: string;
    regions: string[];
  };
  optimization: {
    imageCompression: boolean;
    audioTranscoding: boolean;
    lazyLoading: boolean;
    prefetching: boolean;
  };
}

const defaultFeatureFlags: Record<string, FeatureFlag> = {
  dynamicPricing: {
    id: "dynamic-pricing",
    name: "Dynamic Pricing",
    description: "Enable dynamic pricing based on demand and market conditions",
    enabled: false,
    conditions: {
      userGroups: ["beta"],
      percentage: 50,
    },
  },
  subscriptionModel: {
    id: "subscription-model",
    name: "Subscription Model",
    description: "Enable subscription-based access to music content",
    enabled: false,
    conditions: {
      startDate: "2025-02-01",
    },
  },
  trackBundling: {
    id: "track-bundling",
    name: "Track Bundling",
    description:
      "Allow users to purchase multiple tracks as a bundle with discounts",
    enabled: false,
  },
};

export function useFeatureFlags() {
  const { data: flags } = useQuery(["feature_flags"], async () => {
    // In production, this would fetch from your backend
    return defaultFeatureFlags;
  });

  const isFeatureEnabled = (
    featureId: string,
    context?: {
      userId?: string;
      userGroups?: string[];
      region?: string;
    },
  ) => {
    const flag = flags?.[featureId];
    if (!flag || !flag.enabled) return false;

    if (!flag.conditions) return true;

    const { conditions } = flag;

    // Check user groups
    if (conditions.userGroups && context?.userGroups) {
      if (
        !conditions.userGroups.some((group) =>
          context.userGroups?.includes(group),
        )
      ) {
        return false;
      }
    }

    // Check percentage rollout
    if (conditions.percentage && context?.userId) {
      const hash = hashString(context.userId);
      if (hash % 100 >= conditions.percentage) {
        return false;
      }
    }

    // Check date range
    if (conditions.startDate && new Date() < new Date(conditions.startDate)) {
      return false;
    }
    if (conditions.endDate && new Date() > new Date(conditions.endDate)) {
      return false;
    }

    // Check regions
    if (conditions.regions && context?.region) {
      if (!conditions.regions.includes(context.region)) {
        return false;
      }
    }

    return true;
  };

  return {
    flags,
    isFeatureEnabled,
  };
}

export function useConfig() {
  const { data: pricing } = useQuery(["config-pricing"], async () => {
    // In production, this would fetch from your backend
    return {
      dynamicPricing: {
        enabled: false,
        algorithm: "hybrid",
        updateFrequency: 3600,
        maxAdjustmentPercentage: 15,
      },
      subscriptionModel: {
        enabled: false,
        tiers: [
          {
            id: "basic",
            name: "Basic",
            price: 9.99,
            features: ["Download 10 tracks/month", "Standard license"],
            downloadLimit: 10,
            storageLimitGB: 5,
          },
          {
            id: "pro",
            name: "Professional",
            price: 29.99,
            features: ["Unlimited downloads", "Commercial license"],
            downloadLimit: -1,
            storageLimitGB: 50,
          },
        ],
      },
      bundling: {
        enabled: false,
        minimumTracks: 3,
        maximumTracks: 20,
        discountPercentage: 15,
      },
    } as PricingConfig;
  });

  const { data: performance } = useQuery(["config-performance"], async () => {
    // In production, this would fetch from your backend
    return {
      caching: {
        enabled: true,
        ttl: 3600,
        strategies: {
          browser: true,
          cdn: true,
          server: true,
        },
      },
      cdn: {
        enabled: true,
        provider: "cloudfront",
        regions: ["us-east-1", "eu-west-1", "ap-southeast-1"],
      },
      optimization: {
        imageCompression: true,
        audioTranscoding: true,
        lazyLoading: true,
        prefetching: true,
      },
    } as PerformanceConfig;
  });

  return {
    pricing,
    performance,
  };
}

// Helper function to generate a consistent hash from a string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
