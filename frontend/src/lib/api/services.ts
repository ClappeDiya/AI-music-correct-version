import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import type * as Types from "./types";

const BASE_URL = `${API_BASE_URL}/copyright_free_music`;
const WS_BASE_URL = `${API_BASE_URL.replace("http", "ws")}/copyright_free_music`;

// Generic API factory to reduce code duplication
const createApiService = <T extends { id: string }>(endpoint: string) => ({
  list: async (filters?: any) => {
    const response = await axios.get(`${BASE_URL}/${endpoint}/`, {
      params: filters,
    });
    return response.data;
  },

  get: async (id: string) => {
    const response = await axios.get(`${BASE_URL}/${endpoint}/${id}/`);
    return response.data as T;
  },

  create: async (data: Partial<T>) => {
    const response = await axios.post(`${BASE_URL}/${endpoint}/`, data);
    return response.data as T;
  },

  update: async (id: string, data: Partial<T>) => {
    const response = await axios.put(`${BASE_URL}/${endpoint}/${id}/`, data);
    return response.data as T;
  },

  delete: async (id: string) => {
    await axios.delete(`${BASE_URL}/${endpoint}/${id}/`);
  },
});

// Export API services for all endpoints
export const tracksApi = createApiService<Types.Track>("tracks");
export const licenseTermsApi =
  createApiService<Types.LicenseTermDetails>("license-terms");
export const trackLicensesApi =
  createApiService<Types.TrackLicense>("track-licenses");
export const trackPurchasesApi =
  createApiService<Types.TrackPurchase>("track-purchases");
export const trackDownloadsApi =
  createApiService<Types.TrackDownload>("track-downloads");
export const usageAgreementsApi =
  createApiService<Types.UsageAgreement>("usage-agreements");
export const royaltyTransactionsApi =
  createApiService<Types.RoyaltyTransaction>("royalty-transactions");
export const dynamicPricingRulesApi =
  createApiService<Types.DynamicPricingRule>("dynamic-pricing-rules");
export const externalUsageLogsApi = createApiService<Types.ExternalUsageLog>(
  "external-usage-logs",
);
export const brandedCatalogsApi =
  createApiService<Types.BrandedCatalog>("branded-catalogs");
export const brandedCatalogTracksApi =
  createApiService<Types.BrandedCatalogTrack>("branded-catalog-tracks");
export const regionalLegalFrameworksApi =
  createApiService<Types.RegionalLegalFramework>("regional-legal-frameworks");
export const trackLegalMappingsApi = createApiService<Types.TrackLegalMapping>(
  "track-legal-mappings",
);
export const conditionalLicenseEscalationsApi =
  createApiService<Types.ConditionalLicenseEscalation>(
    "conditional-license-escalations",
  );

export const licensePurchasesApi = {
  ...createApiService<Types.LicensePurchase>("license-purchases"),
  createPaymentIntent: async (data: {
    track_id: string;
    license_id: string;
    payment_provider: string;
  }) => {
    const response = await fetch(
      `${API_BASE_URL}/license-purchases/payment-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    return response.json();
  },
  downloadReceipt: async (purchaseId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/license-purchases/${purchaseId}/receipt`,
      {
        headers: {
          Accept: "application/pdf",
        },
      },
    );
    return response.blob();
  },
};

export const creatorStatsApi = {
  ...createApiService<Types.CreatorStats>("creator-stats"),
  getStats: async (params: { timeRange: string }) => {
    const response = await fetch(
      `${API_BASE_URL}/creator-stats?timeRange=${params.timeRange}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.json();
  },
};

export const royaltyEarningsApi =
  createApiService<Types.RoyaltyEarning>("royalty-earnings");

export const licenseTiersApi =
  createApiService<Types.LicenseTier>("license-tiers");

export const trackAnalyticsApi = {
  getAnalytics: async ({
    start_date,
    end_date,
    timeframe,
  }: {
    start_date: string;
    end_date: string;
    timeframe: string;
  }) => {
    const response = await axios.get(`${BASE_URL}/analytics/`, {
      params: { start_date, end_date, timeframe },
    });
    return response.data;
  },

  getRealTimeAnalytics: async () => {
    const response = await axios.get(`${BASE_URL}/analytics/realtime/`);
    return response.data;
  },

  getEngagementMetrics: async (trackId: string, period: string) => {
    const response = await axios.get(`${BASE_URL}/analytics/engagement/`, {
      params: { track_id: trackId, period },
    });
    return response.data;
  },

  getSocialMetrics: async (trackId: string, period: string) => {
    const response = await axios.get(`${BASE_URL}/analytics/social/`, {
      params: { track_id: trackId, period },
    });
    return response.data;
  },

  getComparativeAnalytics: async (trackId: string, period: string) => {
    const response = await axios.get(`${BASE_URL}/analytics/comparative/`, {
      params: { track_id: trackId, period },
    });
    return response.data;
  },

  exportAnalytics: async (options: {
    format: "csv" | "pdf" | "excel" | "json" | "xml";
    start_date: string;
    end_date: string;
    timeframe: string;
  }) => {
    const response = await axios.post(
      `${BASE_URL}/analytics/export/`,
      options,
      {
        responseType: "blob",
        headers: {
          Accept:
            options.format === "csv"
              ? "text/csv"
              : options.format === "pdf"
                ? "application/pdf"
                : options.format === "excel"
                  ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  : options.format === "json"
                    ? "application/json"
                    : "application/xml",
        },
      },
    );
    return response;
  },

  subscribeToRealTimeUpdates: (onUpdate: (data: any) => void) => {
    const ws = new WebSocket(`${WS_BASE_URL}/analytics/realtime/`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return {
      unsubscribe: () => {
        ws.close();
      },
    };
  },
};

export const licenseAgreementsApi = {
  generateAgreement: async ({
    trackId,
    licenseType,
  }: {
    trackId: string;
    licenseType: string;
  }) => {
    const response = await axios.post(`${BASE_URL}/licenses/generate/`, {
      track_id: trackId,
      license_type: licenseType,
    });
    return response.data;
  },

  signAgreement: async ({
    trackId,
    licenseType,
    termsAccepted,
    signatureData,
    signatureMode,
  }: {
    trackId: string;
    licenseType: string;
    termsAccepted: boolean;
    signatureData: string;
    signatureMode: "draw" | "type";
  }) => {
    const response = await axios.post(`${BASE_URL}/licenses/sign/`, {
      track_id: trackId,
      license_type: licenseType,
      terms_accepted: termsAccepted,
      signature_data: signatureData,
      signature_mode: signatureMode,
    });
    return response.data;
  },

  getLicenseHistory: async () => {
    const response = await axios.get(`${BASE_URL}/licenses/history/`);
    return response.data;
  },

  downloadAgreement: async (agreementId: string, format: "pdf" | "html") => {
    const response = await axios.get(
      `${BASE_URL}/licenses/${agreementId}/download/`,
      {
        params: { format },
        responseType: "blob",
      },
    );
    return response.data;
  },

  getAgreementDetails: async (agreementId: string) => {
    const response = await axios.get(`${BASE_URL}/licenses/${agreementId}/`);
    return response.data;
  },

  customizeAgreement: async (customization: Types.LicenseCustomization) => {
    const response = await axios.post(
      `${BASE_URL}/licenses/customize/`,
      customization,
    );
    return response.data;
  },

  getCustomizationTemplates: async () => {
    const response = await axios.get(`${BASE_URL}/licenses/templates/`);
    return response.data;
  },

  verifySignature: async ({
    agreementId,
    method,
    verificationData,
  }: {
    agreementId: string;
    method: "email" | "phone" | "id_document" | "blockchain";
    verificationData: any;
  }) => {
    const response = await axios.post(
      `${BASE_URL}/licenses/${agreementId}/verify/`,
      {
        method,
        verification_data: verificationData,
      },
    );
    return response.data;
  },

  getVerificationStatus: async (agreementId: string) => {
    const response = await axios.get(
      `${BASE_URL}/licenses/${agreementId}/verification-status/`,
    );
    return response.data;
  },

  getLicenseAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    licenseType?: string;
    territory?: string;
  }) => {
    const response = await axios.get(`${BASE_URL}/licenses/analytics/`, {
      params,
    });
    return response.data;
  },

  getComplianceReport: async (agreementId: string) => {
    const response = await axios.get(
      `${BASE_URL}/licenses/${agreementId}/compliance/`,
    );
    return response.data;
  },

  generateBlockchainProof: async (agreementId: string) => {
    const response = await axios.post(
      `${BASE_URL}/licenses/${agreementId}/blockchain-proof/`,
    );
    return response.data;
  },

  validateBlockchainProof: async (agreementId: string, proofData: any) => {
    const response = await axios.post(
      `${BASE_URL}/licenses/${agreementId}/validate-blockchain-proof/`,
      proofData,
    );
    return response.data;
  },
};

export const disputeApi = {
  submitDispute: async (data: {
    track_id: string;
    type: string;
    details: {
      title: string;
      description: string;
      evidence_urls: string[];
    };
  }) => {
    const response = await axios.post(`${BASE_URL}/disputes/`, data);
    return response.data;
  },

  getDisputeDetails: async (caseId: string) => {
    const response = await axios.get(`${BASE_URL}/disputes/${caseId}/`);
    return response.data;
  },

  updateDispute: async (caseId: string, data: Partial<Types.DisputeCase>) => {
    const response = await axios.patch(`${BASE_URL}/disputes/${caseId}/`, data);
    return response.data;
  },

  addCommunication: async (
    caseId: string,
    data: {
      message: string;
      attachments?: string[];
    },
  ) => {
    const response = await axios.post(
      `${BASE_URL}/disputes/${caseId}/messages/`,
      data,
    );
    return response.data;
  },

  submitEvidence: async (caseId: string, evidence: FormData) => {
    const response = await axios.post(
      `${BASE_URL}/disputes/${caseId}/evidence/`,
      evidence,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  appealResolution: async (
    caseId: string,
    data: {
      reason: string;
      additional_evidence?: string[];
    },
  ) => {
    const response = await axios.post(
      `${BASE_URL}/disputes/${caseId}/appeal/`,
      data,
    );
    return response.data;
  },

  getNotifications: async (params?: {
    unread_only?: boolean;
    type?: string;
  }) => {
    const response = await axios.get(`${BASE_URL}/disputes/notifications/`, {
      params,
    });
    return response.data;
  },

  markNotificationRead: async (notificationId: string) => {
    const response = await axios.post(
      `${BASE_URL}/disputes/notifications/${notificationId}/read/`,
    );
    return response.data;
  },
};

export const moderationApi = {
  getModerationQueue: async (params?: {
    status?: string;
    priority?: string;
    type?: string;
  }) => {
    const response = await axios.get(`${BASE_URL}/moderation/queue/`, {
      params,
    });
    return response.data;
  },

  assignModerator: async (caseId: string, moderatorId: string) => {
    const response = await axios.post(
      `${BASE_URL}/moderation/cases/${caseId}/assign/`,
      {
        moderator_id: moderatorId,
      },
    );
    return response.data;
  },

  takeAction: async (caseId: string, action: Types.ModerationAction) => {
    const response = await axios.post(
      `${BASE_URL}/moderation/cases/${caseId}/actions/`,
      action,
    );
    return response.data;
  },

  getDashboardStats: async (params?: {
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await axios.get(`${BASE_URL}/moderation/stats/`, {
      params,
    });
    return response.data;
  },

  getFlaggedTracks: async (params?: { status?: string; sort_by?: string }) => {
    const response = await axios.get(`${BASE_URL}/moderation/flagged-tracks/`, {
      params,
    });
    return response.data;
  },

  reviewTrack: async (
    trackId: string,
    decision: {
      action: string;
      reason: string;
      sanctions?: string[];
    },
  ) => {
    const response = await axios.post(
      `${BASE_URL}/moderation/tracks/${trackId}/review/`,
      decision,
    );
    return response.data;
  },
};

// Feature Flag API Services
export const featureFlagApi = {
  list: () => axios.get("/api/feature_flags/"),

  get: (key: string) => axios.get(`/api/feature_flags/${key}/`),

  create: (data: Partial<Types.FeatureFlag>) =>
    axios.post("/api/feature_flags/", data),

  update: (key: string, data: Partial<Types.FeatureFlag>) =>
    axios.put(`/api/feature_flags/${key}/`, data),

  delete: (key: string) => axios.delete(`/api/feature_flags/${key}/`),

  evaluate: (key: string, context: Record<string, any>) =>
    axios.post(`/api/feature_flags/${key}/evaluate/`, { context }),

  recordMetrics: (
    key: string,
    data: {
      success: boolean;
      latency_ms: number;
      context: Record<string, any>;
    },
  ) => axios.post(`/api/feature_flags/${key}/metrics/`, data),

  getAnalytics: (key: string, startDate: Date, endDate: Date) =>
    axios.get(`/api/feature_flags/${key}/analytics/`, {
      params: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    }),

  getAuditLogs: (key: string) =>
    axios.get(`/api/feature_flags/${key}/audit-logs/`),
};
