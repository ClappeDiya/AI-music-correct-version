import { cache } from "react";

interface CacheConfig {
  lessonCacheDuration: number;
  userProgressCacheDuration: number;
  maxCacheSize: number;
}

interface CdnConfig {
  baseUrl: string;
  videoQualityLevels: string[];
  imageOptimizationParams: {
    quality: number;
    format: "webp" | "jpeg" | "png";
    sizes: number[];
  };
}

interface PerformanceConfig {
  maxConcurrentUploads: number;
  maxFileSize: number;
  compressionLevel: number;
  preloadDistance: number;
  lazyLoadThreshold: number;
}

interface EnvironmentConfig {
  environment: "development" | "staging" | "production";
  apiUrl: string;
  cache: CacheConfig;
  cdn: CdnConfig;
  performance: PerformanceConfig;
  features: Record<string, boolean>;
}

export class EnvironmentConfigService {
  private static instance: EnvironmentConfigService;
  private config: EnvironmentConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): EnvironmentConfigService {
    if (!EnvironmentConfigService.instance) {
      EnvironmentConfigService.instance = new EnvironmentConfigService();
    }
    return EnvironmentConfigService.instance;
  }

  private loadConfig(): EnvironmentConfig {
    // Load from environment variables or config file
    return {
      environment: process.env.NODE_ENV as
        | "development"
        | "staging"
        | "production",
      apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
      cache: {
        lessonCacheDuration: 3600, // 1 hour
        userProgressCacheDuration: 300, // 5 minutes
        maxCacheSize: 50 * 1024 * 1024, // 50MB
      },
      cdn: {
        baseUrl: process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.example.com",
        videoQualityLevels: ["360p", "480p", "720p", "1080p"],
        imageOptimizationParams: {
          quality: 80,
          format: "webp",
          sizes: [320, 640, 1024, 1920],
        },
      },
      performance: {
        maxConcurrentUploads: 3,
        maxFileSize: 100 * 1024 * 1024, // 100MB
        compressionLevel: 0.8,
        preloadDistance: 2, // Number of items to preload
        lazyLoadThreshold: 100, // Pixels before viewport to start loading
      },
      features: {
        enableVideoTranscoding: true,
        enableImageOptimization: true,
        enableCaching: true,
        enableAnalytics: true,
      },
    };
  }

  public getConfig(): EnvironmentConfig {
    return this.config;
  }

  public isProduction(): boolean {
    return this.config.environment === "production";
  }

  public getCdnUrl(
    path: string,
    options?: {
      quality?: string;
      width?: number;
      format?: "webp" | "jpeg" | "png";
    },
  ): string {
    const baseUrl = this.config.cdn.baseUrl;
    const params = new URLSearchParams();

    if (options?.quality) {
      params.append("q", options.quality);
    }

    if (options?.width) {
      params.append("w", options.width.toString());
    }

    if (options?.format) {
      params.append("fm", options.format);
    }

    const queryString = params.toString();
    return `${baseUrl}/${path}${queryString ? `?${queryString}` : ""}`;
  }

  public getVideoUrl(videoId: string, quality: string): string {
    if (!this.config.cdn.videoQualityLevels.includes(quality)) {
      quality = this.config.cdn.videoQualityLevels[0];
    }
    return this.getCdnUrl(`videos/${videoId}`, { quality });
  }

  public getImageUrl(imageId: string, width: number): string {
    const sizes = this.config.cdn.imageOptimizationParams.sizes;
    const targetSize =
      sizes.find((size) => size >= width) || sizes[sizes.length - 1];

    return this.getCdnUrl(`images/${imageId}`, {
      width: targetSize,
      format: this.config.cdn.imageOptimizationParams.format,
    });
  }

  public shouldCache(resourceType: "lesson" | "userProgress"): boolean {
    if (!this.config.features.enableCaching) return false;

    const currentCache = this.getCurrentCacheSize();
    return currentCache < this.config.cache.maxCacheSize;
  }

  public getCacheDuration(resourceType: "lesson" | "userProgress"): number {
    return resourceType === "lesson"
      ? this.config.cache.lessonCacheDuration
      : this.config.cache.userProgressCacheDuration;
  }

  private getCurrentCacheSize(): number {
    if (typeof window === "undefined") return 0;

    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        total += (localStorage.getItem(key) || "").length;
      }
    }
    return total;
  }

  public getPerformanceConfig(): PerformanceConfig {
    return this.config.performance;
  }

  public isFeatureEnabled(featureKey: string): boolean {
    return this.config.features[featureKey] || false;
  }

  public updateConfig(partialConfig: Partial<EnvironmentConfig>): void {
    this.config = {
      ...this.config,
      ...partialConfig,
    };
  }
}
