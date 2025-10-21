import { api } from "@/lib/api";

export interface TrackVersion {
  id: string;
  version: number;
  createdAt: string;
  changes: string;
  userId: string;
}

export interface TrackReference {
  id: string;
  originalTrackId: string;
  moduleType: "ai_generation" | "genre_mixing" | "user_profile" | "playlist";
  moduleId: string;
  userId: string;
  versions: TrackVersion[];
  currentVersion: number;
  metadata: {
    title: string;
    description?: string;
    tags?: string[];
    visibility: "private" | "public" | "shared";
    sharedWith?: string[];
  };
}

class TrackReferenceService {
  // Create a new track reference
  async createReference(params: {
    trackId: string;
    moduleType: TrackReference["moduleType"];
    moduleId: string;
    metadata: TrackReference["metadata"];
  }): Promise<TrackReference> {
    const response = await api.post("/api/track-references/", params);
    return response.data;
  }

  // Get track reference by ID
  async getReference(referenceId: string): Promise<TrackReference> {
    const response = await api.get(`/api/track-references/${referenceId}/`);
    return response.data;
  }

  // Get all references for a track
  async getTrackReferences(trackId: string): Promise<TrackReference[]> {
    const response = await api.get(`/api/tracks/${trackId}/references/`);
    return response.data;
  }

  // Get all references in a module
  async getModuleReferences(
    moduleType: TrackReference["moduleType"],
    moduleId: string,
  ): Promise<TrackReference[]> {
    const response = await api.get(
      `/api/modules/${moduleType}/${moduleId}/references/`,
    );
    return response.data;
  }

  // Create a new version
  async createVersion(
    referenceId: string,
    changes: string,
  ): Promise<TrackVersion> {
    const response = await api.post(
      `/api/track-references/${referenceId}/versions/`,
      {
        changes,
      },
    );
    return response.data;
  }

  // Get version history
  async getVersionHistory(referenceId: string): Promise<TrackVersion[]> {
    const response = await api.get(
      `/api/track-references/${referenceId}/versions/`,
    );
    return response.data;
  }

  // Switch to a specific version
  async switchVersion(
    referenceId: string,
    versionId: string,
  ): Promise<TrackReference> {
    const response = await api.post(
      `/api/track-references/${referenceId}/switch-version/`,
      {
        versionId,
      },
    );
    return response.data;
  }

  // Update reference metadata
  async updateMetadata(
    referenceId: string,
    metadata: Partial<TrackReference["metadata"]>,
  ): Promise<TrackReference> {
    const response = await api.patch(`/api/track-references/${referenceId}/`, {
      metadata,
    });
    return response.data;
  }
}

export const trackReferenceService = new TrackReferenceService();
