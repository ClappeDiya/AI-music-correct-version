import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import type {
  Instrument,
  Effect,
  StudioSession,
  Track,
  TrackInstrument,
  TrackEffect,
  InstrumentPreset,
  EffectPreset,
  SessionTemplate,
  ExportedFile,
  VrArSetting,
  AiSuggestion,
  AdaptiveAutomationEvent,
} from "@/types/virtual_studio";

interface ShareSettings {
  isPublic: boolean;
  allowCollaboration: boolean;
  sharedWith: Array<{
    email: string;
    permission: "view" | "edit";
  }>;
}

interface PerformanceMetrics {
  cpuLoad: number;
  memoryUsage: number;
  latency: number;
  bufferUnderruns: number;
  processingTime: number;
}

/**
 * Helper function to build URL with query parameters
 * Ensures trailing slash for Django compatibility
 */
const buildUrl = (baseUrl: string, params?: Record<string, any>): string => {
  // Ensure base URL has trailing slash for Django compatibility
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url = `${url}/`;
  }
  
  if (!params) return url;
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

class VirtualStudioApi {
  private baseUrl = "/api/virtual_studio/";

  // Instruments
  async getInstruments(filters?: {
    name?: string;
    instrument_type?: string;
    is_public?: boolean;
  }) {
    const url = buildUrl(`${this.baseUrl}instruments/`, filters);
    const { data } = await fetchWithAuth(url);
    return data as Instrument[];
  }

  async createInstrument(
    instrument: Omit<
      Instrument,
      "id" | "created_at" | "updated_at" | "created_by"
    >,
  ) {
    const url = buildUrl(`${this.baseUrl}instruments/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(instrument),
    });
    return data as Instrument;
  }

  // Effects
  async getEffects(filters?: {
    name?: string;
    effect_type?: string;
    is_public?: boolean;
  }) {
    const url = buildUrl(`${this.baseUrl}effects/`, filters);
    const { data } = await fetchWithAuth(url);
    return data as Effect[];
  }

  async createEffect(
    effect: Omit<Effect, "id" | "created_at" | "updated_at" | "created_by">,
  ) {
    const url = buildUrl(`${this.baseUrl}effects/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(effect),
    });
    return data as Effect;
  }

  // Studio Sessions
  async getSessions(filters?: { session_name?: string; is_public?: boolean }) {
    const url = buildUrl(`${this.baseUrl}sessions/`, filters);
    const { data } = await fetchWithAuth(url);
    return data as StudioSession[];
  }

  async createSession(
    session: Omit<StudioSession, "id" | "created_at" | "updated_at" | "user">,
  ) {
    const url = buildUrl(`${this.baseUrl}sessions/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(session),
    });
    return data as StudioSession;
  }

  // Tracks
  async getTracks(filters?: {
    track_name?: string;
    track_type?: string;
    session?: number;
  }) {
    const url = buildUrl(`${this.baseUrl}tracks/`, filters);
    const { data } = await fetchWithAuth(url);
    return data as Track[];
  }

  async createTrack(track: Omit<Track, "id" | "created_at">) {
    const url = buildUrl(`${this.baseUrl}tracks/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(track),
    });
    return data as Track;
  }

  // Track Instruments
  async getTrackInstruments(filters?: { track?: number; instrument?: number }) {
    const url = buildUrl(`${this.baseUrl}track-instruments/`, filters);
    const { data } = await fetchWithAuth(url);
    return data as TrackInstrument[];
  }

  async createTrackInstrument(
    trackInstrument: Omit<TrackInstrument, "id" | "created_at" | "created_by">,
  ) {
    const url = buildUrl(`${this.baseUrl}track-instruments/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(trackInstrument),
    });
    return data as TrackInstrument;
  }

  // Track Effects
  async getTrackEffects(filters?: { track?: number; effect?: number }) {
    const url = buildUrl(`${this.baseUrl}track-effects/`, filters);
    const { data } = await fetchWithAuth(url);
    return data as TrackEffect[];
  }

  async createTrackEffect(
    trackEffect: Omit<TrackEffect, "id" | "created_at" | "created_by">,
  ) {
    const url = buildUrl(`${this.baseUrl}track-effects/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(trackEffect),
    });
    return data as TrackEffect;
  }

  // Instrument Presets
  async getInstrumentPresets(filters?: {
    preset_name?: string;
    instrument?: number;
    is_public?: boolean;
  }) {
    const url = buildUrl(`${this.baseUrl}instrument-presets/`, filters);
    const { data } = await fetchWithAuth(url);
    return data as InstrumentPreset[];
  }

  async createInstrumentPreset(
    preset: Omit<InstrumentPreset, "id" | "created_at" | "user">,
  ) {
    const url = buildUrl(`${this.baseUrl}instrument-presets/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(preset),
    });
    return data as InstrumentPreset;
  }

  // Effect Presets
  async getEffectPresets(filters?: {
    preset_name?: string;
    effect?: number;
    is_public?: boolean;
  }) {
    const url = buildUrl(`${this.baseUrl}effect-presets/`, filters);
    const { data } = await fetchWithAuth(url);
    return data as EffectPreset[];
  }

  async createEffectPreset(
    preset: Omit<EffectPreset, "id" | "created_at" | "user">,
  ) {
    const url = buildUrl(`${this.baseUrl}effect-presets/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(preset),
    });
    return data as EffectPreset;
  }

  // Session Templates
  async getSessionTemplates(filters?: {
    template_name?: string;
    is_public?: boolean;
  }) {
    const url = buildUrl(`${this.baseUrl}session-templates/`, filters);
    const { data } = await fetchWithAuth(url);
    return data as SessionTemplate[];
  }

  async createSessionTemplate(
    template: Omit<SessionTemplate, "id" | "created_at" | "user">,
  ) {
    const url = buildUrl(`${this.baseUrl}session-templates/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(template),
    });
    return data as SessionTemplate;
  }

  // Exported Files
  async getExportedFiles(filters?: { session?: number; format?: string }) {
    const url = buildUrl(`${this.baseUrl}exported-files/`, filters);
    const { data } = await fetchWithAuth(url);
    return data as ExportedFile[];
  }

  async createExportedFile(
    file: Omit<ExportedFile, "id" | "created_at" | "created_by">,
  ) {
    const url = buildUrl(`${this.baseUrl}exported-files/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(file),
    });
    return data as ExportedFile;
  }

  // VR/AR Settings
  async getVrArSettings(filters?: { session?: number }) {
    const url = buildUrl(`${this.baseUrl}vr-ar-settings/`, filters);
    const { data } = await fetchWithAuth(url);
    return data as VrArSetting[];
  }

  async createVrArSetting(
    setting: Omit<VrArSetting, "id" | "created_at" | "created_by">,
  ) {
    const url = buildUrl(`${this.baseUrl}vr-ar-settings/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(setting),
    });
    return data as VrArSetting;
  }

  // AI Suggestions
  async getAiSuggestions(filters?: {
    session?: number;
    suggestion_type?: string;
    applied?: boolean;
  }) {
    const url = buildUrl(`${this.baseUrl}ai-suggestions/`, filters);
    const { data } = await fetchWithAuth(url);
    return data as AiSuggestion[];
  }

  async createAiSuggestion(
    suggestion: Omit<AiSuggestion, "id" | "created_at" | "created_by">,
  ) {
    const url = buildUrl(`${this.baseUrl}ai-suggestions/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(suggestion),
    });
    return data as AiSuggestion;
  }

  // Adaptive Automation Events
  async getAdaptiveAutomationEvents(filters?: {
    session?: number;
    event_type?: string;
  }) {
    const url = buildUrl(`${this.baseUrl}adaptive-automation-events/`, filters);
    const { data } = await fetchWithAuth(url);
    return data as AdaptiveAutomationEvent[];
  }

  async createAdaptiveAutomationEvent(
    event: Omit<AdaptiveAutomationEvent, "id" | "created_at" | "created_by">,
  ) {
    const url = buildUrl(`${this.baseUrl}adaptive-automation-events/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(event),
    });
    return data as AdaptiveAutomationEvent;
  }

  // Session Sharing
  async getSessionSharing(sessionId: string) {
    const url = buildUrl(`${this.baseUrl}sessions/${sessionId}/sharing/`);
    const { data } = await fetchWithAuth(url);
    return data as ShareSettings;
  }

  async updateSessionSharing(sessionId: string, settings: ShareSettings) {
    const url = buildUrl(`${this.baseUrl}sessions/${sessionId}/sharing/`);
    const { data } = await fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify(settings),
    });
    return data as ShareSettings;
  }

  async addSessionShare(
    sessionId: string,
    share: { email: string; permission: "view" | "edit" },
  ) {
    const url = buildUrl(`${this.baseUrl}sessions/${sessionId}/shares/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(share),
    });
    return data;
  }

  async removeSessionShare(sessionId: string, email: string) {
    const url = buildUrl(`${this.baseUrl}sessions/${sessionId}/shares/${email}/`);
    await fetchWithAuth(url, { method: "DELETE" });
  }

  // Performance Metrics
  async reportPerformanceMetrics(
    sessionId: string,
    metrics: PerformanceMetrics,
  ) {
    const url = buildUrl(`${this.baseUrl}sessions/${sessionId}/performance/`);
    const { data } = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(metrics),
    });
    return data;
  }
}

export const virtualStudioApi = new VirtualStudioApi();
