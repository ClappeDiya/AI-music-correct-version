import api from "./api";

export interface UserPreference {
  id: string;
  user: string;
  created_at: string;
  updated_at: string;
}

export interface PreferenceProfile extends UserPreference {
  name: string;
  is_active: boolean;
  preferences: Record<string, any>;
}

export interface ThemeSettings extends UserPreference {
  theme: string;
  color_scheme: string;
}

export interface LayoutSettings extends UserPreference {
  layout_type: string;
  density: "compact" | "comfortable" | "spacious";
}

const BASE_URL = "/api/v1/user-preferences";

export const userPreferencesService = {
  // Profiles
  getProfiles: () => api.get<PreferenceProfile[]>(`${BASE_URL}/profiles`),

  createProfile: (data: Partial<PreferenceProfile>) =>
    api.post<PreferenceProfile>(`${BASE_URL}/profiles`, data),

  updateProfile: (id: string, data: Partial<PreferenceProfile>) =>
    api.patch<PreferenceProfile>(`${BASE_URL}/profiles/${id}`, data),

  activateProfile: (id: string) =>
    api.post<PreferenceProfile>(`${BASE_URL}/profiles/${id}/activate`),

  // Theme
  getTheme: () => api.get<ThemeSettings>(`${BASE_URL}/theme`),

  updateTheme: (data: Partial<ThemeSettings>) =>
    api.patch<ThemeSettings>(`${BASE_URL}/theme`, data),

  // Layout
  getLayout: () => api.get<LayoutSettings>(`${BASE_URL}/layout`),

  updateLayout: (data: Partial<LayoutSettings>) =>
    api.patch<LayoutSettings>(`${BASE_URL}/layout`, data),

  updateDensity: (density: LayoutSettings["density"]) =>
    api.patch<LayoutSettings>(`${BASE_URL}/layout/density`, { density }),

  // Behavior Overlays
  getOverlays: () => api.get(`${BASE_URL}/behavior-overlays`),

  createOverlay: (data: any) => api.post(`${BASE_URL}/behavior-overlays`, data),

  previewOverlay: (id: string) =>
    api.post(`${BASE_URL}/behavior-overlays/${id}/preview`),

  activateOverlay: (id: string) =>
    api.post(`${BASE_URL}/behavior-overlays/${id}/activate`),

  deactivateOverlay: (id: string) =>
    api.post(`${BASE_URL}/behavior-overlays/${id}/deactivate`),

  // Persona Fusion
  getPersonas: () => api.get(`${BASE_URL}/personas`),

  getActivePersonaFusions: () =>
    api.get(`${BASE_URL}/persona-fusion?is_active=true`),

  previewPersonaFusion: (data: any) =>
    api.post(`${BASE_URL}/persona-fusion/preview`, data),

  createPersonaFusion: (data: any) =>
    api.post(`${BASE_URL}/persona-fusion`, data),

  activatePersonaFusion: (id: string) =>
    api.post(`${BASE_URL}/persona-fusion/${id}/activate`),

  rollbackPersonaFusion: (id: string) =>
    api.post(`${BASE_URL}/persona-fusion/${id}/rollback`),

  // Privacy Settings
  getPrivacySettings: () => api.get(`${BASE_URL}/privacy`),

  updatePrivacySettings: (data: any) => api.patch(`${BASE_URL}/privacy`, data),

  // Predictive Preferences
  getActivePredictions: () => api.get(`${BASE_URL}/predictive/active`),

  revertPredictiveEvent: (eventId: string) =>
    api.post(`${BASE_URL}/predictive/${eventId}/revert`),

  acceptPredictiveEvent: (eventId: string) =>
    api.post(`${BASE_URL}/predictive/${eventId}/accept`),

  // Version History
  getVersionHistory: () => api.get(`${BASE_URL}/versions/history`),

  rollbackVersion: (versionId: string) =>
    api.post(`${BASE_URL}/versions/${versionId}/rollback`),

  // Ephemeral Events
  getActiveEvents: () => api.get(`${BASE_URL}/event-preferences/active`),

  createEventPreference: (data: any) =>
    api.post(`${BASE_URL}/event-preferences`, data),

  deactivateEvent: (id: string) =>
    api.post(`${BASE_URL}/event-preferences/${id}/deactivate`),

  // Multi-user Composite
  getActiveComposites: () => api.get(`${BASE_URL}/multi-user/active`),

  getPreferenceCategories: () => api.get(`${BASE_URL}/multi-user/categories`),

  createComposite: (data: any) =>
    api.post(`${BASE_URL}/multi-user/composite`, data),

  updateCompositePreferences: (id: string, data: any) =>
    api.patch(`${BASE_URL}/multi-user/composite/${id}`, data),

  saveAsPreset: (id: string) =>
    api.post(`${BASE_URL}/multi-user/composite/${id}/preset`),

  // Translingual Preferences
  getSupportedLocales: () => api.get(`${BASE_URL}/translingual/locales`),

  storeTranslingualPreferences: (data: any) =>
    api.post(`${BASE_URL}/translingual/store`, data),

  updateLocale: (data: any) =>
    api.post(`${BASE_URL}/translingual/locale`, data),

  // Universal Profile Export
  exportPreferences: (data: any) =>
    api.post(`${BASE_URL}/universal/export`, data),

  // Currency
  getCurrency: () => api.get(`${BASE_URL}/currency`),

  setCurrency: (currency: string) =>
    api.post(`${BASE_URL}/currency/set`, { currency }),
};
