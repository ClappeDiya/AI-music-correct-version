import { api } from "@/lib/api";

// Interfaces
export interface UserSettings {
  id: number;
  user: number;
  preferences: Record<string, any>;
  device_specific_settings: Record<string, any>;
  last_updated: string;
}

export interface PreferenceInheritanceLayer {
  id: number;
  user: number;
  parent_layer: number | null;
  inheritance_rules: Record<string, any>;
  priority: number;
}

export interface UserSensoryTheme {
  id: number;
  user: number;
  theme_parameters: Record<string, any>;
  active: boolean;
}

export interface ContextualProfile {
  id: number;
  user: number;
  context_type: string;
  settings: Record<string, any>;
  active_timeframe: {
    start: string;
    end: string;
  };
}

export interface UserSettingsHistory {
  id: number;
  user: number;
  settings: Record<string, any>;
  timestamp: string;
}

export interface PreferenceSuggestion {
  id: number;
  user: number;
  suggestion: string;
  timestamp: string;
}

export interface PreferenceExternalization {
  id: number;
  user: number;
  external_identity_ref: string;
  exported_preferences_hash: string;
  linked_at: string;
  service_name: string;
  description?: string;
  active: boolean;
  endpoint_url: string;
  sync_frequency: number;
  last_sync?: string;
}

export interface EphemeralEventPreference {
  id: number;
  user: number;
  event_key: string;
  ephemeral_prefs: Record<string, any>;
  next_scheduled?: string;
}

export interface PersonaFusion {
  id: number;
  user: number;
  source_personas: string[];
  fused_profile: Record<string, any>;
}

export interface BehaviorTriggeredOverlay {
  id: number;
  user: number;
  trigger_conditions: Record<string, any>;
  overlay_prefs: Record<string, any>;
  active: boolean;
}

export interface MultiUserComposite {
  id: number;
  participant_user_ids: number[];
  composite_prefs: Record<string, any>;
}

export interface PredictivePreferenceModel {
  id: number;
  user: number;
  model_metadata: Record<string, any>;
}

export interface PredictivePreferenceEvent {
  id: number;
  user: number;
  applied_changes: Record<string, any>;
  reason?: string;
  applied_at: string;
}

// ADDED: New interfaces for endpoints not previously covered
export interface TranslingualPreference {
  id: number;
  user: number;
  languagePreferences: Record<string, any>;
}

export interface UniversalProfileMapping {
  id: number;
  user: number;
  mapping: Record<string, any>;
}

// Main Settings Service
export class SettingsService {
  // User Settings
  async getUserSettings(): Promise<UserSettings> {
    const response = await api.get("/api/usersettings/");
    return response.data;
  }

  async updateUserSettings(
    id: number,
    settings: Partial<UserSettings>,
  ): Promise<UserSettings> {
    const response = await api.patch(`/api/usersettings/${id}/`, settings);
    return response.data;
  }

  // Preference Inheritance
  async getInheritanceLayers(): Promise<PreferenceInheritanceLayer[]> {
    const response = await api.get("/api/preferenceinheritance/");
    return response.data;
  }

  async createInheritanceLayer(
    layer: Partial<PreferenceInheritanceLayer>,
  ): Promise<PreferenceInheritanceLayer> {
    const response = await api.post("/api/preferenceinheritance/", layer);
    return response.data;
  }

  // Sensory Themes
  async getSensoryThemes(): Promise<UserSensoryTheme[]> {
    const response = await api.get("/api/usersensorytheme/");
    return response.data;
  }

  async updateSensoryTheme(
    id: number,
    theme: Partial<UserSensoryTheme>,
  ): Promise<UserSensoryTheme> {
    const response = await api.patch(`/api/usersensorytheme/${id}/`, theme);
    return response.data;
  }

  // Contextual Profiles
  async getContextualProfiles(): Promise<ContextualProfile[]> {
    const response = await api.get("/api/contextualprofile/");
    return response.data;
  }

  async createContextualProfile(
    profile: Partial<ContextualProfile>,
  ): Promise<ContextualProfile> {
    const response = await api.post("/api/contextualprofile/", profile);
    return response.data;
  }

  // Add methods for backend-only endpoints
  async getUserSettingsHistory(): Promise<UserSettingsHistory[]> {
    const response = await api.get("/api/usersettingshistory/");
    return response.data;
  }

  async getPreferenceSuggestions(): Promise<PreferenceSuggestion[]> {
    const response = await api.get("/api/preferencesuggestion/");
    return response.data;
  }

  // Preference Externalization
  async getPreferenceExternalizations(): Promise<PreferenceExternalization[]> {
    const response = await api.get("/api/preferenceexternalization/");
    return response.data;
  }

  async createPreferenceExternalization(
    data: Partial<PreferenceExternalization>,
  ): Promise<PreferenceExternalization> {
    const response = await api.post("/api/preferenceexternalization/", data);
    return response.data;
  }

  async syncPreferenceExternalization(
    id: number,
  ): Promise<PreferenceExternalization> {
    const response = await api.post(
      `/api/preferenceexternalization/${id}/sync_now/`,
    );
    return response.data;
  }

  // Ephemeral Event Preferences
  async getEphemeralPreferences(): Promise<EphemeralEventPreference[]> {
    const response = await api.get("/api/ephemeraleventpreference/");
    return response.data;
  }

  async scheduleEphemeralPreference(
    id: number,
    nextScheduled: string,
  ): Promise<EphemeralEventPreference> {
    const response = await api.post(
      `/api/ephemeraleventpreference/${id}/schedule/`,
      {
        next_scheduled: nextScheduled,
      },
    );
    return response.data;
  }

  // Persona Fusion
  async getPersonaFusions(): Promise<PersonaFusion[]> {
    const response = await api.get("/api/personafusion/");
    return response.data;
  }

  async createPersonaFusion(
    data: Partial<PersonaFusion>,
  ): Promise<PersonaFusion> {
    const response = await api.post("/api/personafusion/", data);
    return response.data;
  }

  // Behavior Triggered Overlays
  async getBehaviorOverlays(): Promise<BehaviorTriggeredOverlay[]> {
    const response = await api.get("/api/behaviortriggeredoverlay/");
    return response.data;
  }

  async previewBehaviorOverlay(id: number): Promise<any> {
    const response = await api.post(
      `/api/behaviortriggeredoverlay/${id}/preview/`,
    );
    return response.data;
  }

  // Multi-User Composite
  async getMultiUserComposites(): Promise<MultiUserComposite[]> {
    const response = await api.get("/api/multiusercomposite/");
    return response.data;
  }

  // Predictive Preference
  async getPredictiveModels(): Promise<PredictivePreferenceModel[]> {
    const response = await api.get("/api/predictivepreferencemodel/");
    return response.data;
  }

  async getPredictiveEvents(): Promise<PredictivePreferenceEvent[]> {
    const response = await api.get("/api/predictivepreferenceevent/");
    return response.data;
  }

  // Generic activation/deactivation methods
  private async toggleActivation(
    endpoint: string,
    id: number,
    action: "activate" | "deactivate",
  ): Promise<any> {
    const response = await api.post(`/api/${endpoint}/${id}/${action}/`);
    return response.data;
  }

  // Helper methods for activation/deactivation
  async activateProfile(id: number): Promise<any> {
    return this.toggleActivation("usersettings", id, "activate");
  }

  async deactivateProfile(id: number): Promise<any> {
    return this.toggleActivation("usersettings", id, "deactivate");
  }

  async duplicateProfile(id: number): Promise<UserSettings> {
    const response = await api.post(`/api/usersettings/${id}/duplicate/`);
    return response.data;
  }

  // Currency preferences
  async getCurrency(): Promise<string> {
    const response = await api.get("/api/usersettings/currency/");
    return response.data.currency;
  }

  async setCurrency(currency: string): Promise<void> {
    await api.post("/api/usersettings/currency/", { currency });
  }

  async getTranslingualPreferences(): Promise<TranslingualPreference[]> {
    const response = await api.get("/api/translingualpreference/");
    return response.data;
  }

  async getUniversalProfileMappings(): Promise<UniversalProfileMapping[]> {
    const response = await api.get("/api/universalprofilemapping/");
    return response.data;
  }
}

export const settingsService = new SettingsService();
