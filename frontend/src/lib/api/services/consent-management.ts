import api from "../";
import type { ApiResponse } from "../";

export interface ConsentSettings {
  id: number;
  user_id: number;
  voice_id: number;
  usage_consent: boolean;
  data_retention: boolean;
  third_party_usage: boolean;
  last_updated: string;
  expiry_date?: string;
}

export interface ConsentVerification {
  status: "valid" | "expired" | "revoked" | "invalid";
  message: string;
  required_actions?: string[];
}

export const ConsentManagementService = {
  getConsentSettings: (voiceId: number) =>
    api.get<ConsentSettings>(`/api/voice/${voiceId}/consent`),

  updateConsentSettings: (
    voiceId: number,
    settings: Partial<ConsentSettings>,
  ) => api.patch<ConsentSettings>(`/api/voice/${voiceId}/consent`, settings),

  revokeConsent: (voiceId: number) =>
    api.post<{ success: boolean }>(`/api/voice/${voiceId}/revoke-consent`),

  verifyConsent: (voiceId: number) =>
    api.get<ConsentVerification>(`/api/voice/${voiceId}/verify-consent`),

  deleteVoiceData: (voiceId: number) =>
    api.delete<{ success: boolean }>(`/api/voice/${voiceId}`),
};
