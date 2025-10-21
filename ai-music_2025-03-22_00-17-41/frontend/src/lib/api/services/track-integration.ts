import api from "../";
import type { GeneratedTrack, Mood } from "./mood";

export interface TrackIntegration {
  track_id: string;
  source_module: "mood" | "studio" | "dj" | "lyrics";
  target_module: "mood" | "studio" | "dj" | "lyrics";
  emotional_context: {
    mood_id?: number;
    mood_name?: string;
    intensity?: number;
    parameters?: Record<string, any>;
    color?: string;
  };
  metadata: Record<string, any>;
  user_id: number;
  created_at: string;
}

export interface IntegrationRequest {
  track_id: string;
  target_module: TrackIntegration["target_module"];
  additional_parameters?: Record<string, any>;
}

export const TrackIntegrationService = {
  // Port a track to another module
  portTrack: (request: IntegrationRequest) =>
    api.post<TrackIntegration>("/api/track-integration/port", request),

  // Get a track's integration status and history
  getTrackIntegrations: (trackId: string) =>
    api.get<TrackIntegration[]>(`/api/track-integration/${trackId}`),

  // Get all tracks available for integration in a module
  getAvailableTracks: (moduleType: TrackIntegration["target_module"]) =>
    api.get<{
      tracks: Array<{
        id: string;
        name: string;
        mood: Mood;
        preview_url: string;
      }>;
    }>(`/api/track-integration/available/${moduleType}`),

  // Update emotional context for a track
  updateEmotionalContext: (
    trackId: string,
    context: TrackIntegration["emotional_context"],
  ) =>
    api.patch<TrackIntegration>(
      `/api/track-integration/${trackId}/context`,
      context,
    ),

  // Share a track with another user
  shareTrack: (trackId: string, targetUserId: number) =>
    api.post<{ success: boolean }>(`/api/track-integration/${trackId}/share`, {
      user_id: targetUserId,
    }),

  // Check if user has access to a track
  checkAccess: (trackId: string) =>
    api.get<{ has_access: boolean; owner_id: number }>(
      `/api/track-integration/${trackId}/access`,
    ),
};
