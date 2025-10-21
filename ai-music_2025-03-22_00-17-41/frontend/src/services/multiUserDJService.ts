import axios from "axios";

const API_BASE_URL = "/api/multi_user";

export interface User {
  id: string;
  username: string;
  avatar?: string;
}

export interface DJSession {
  id: string;
  name: string;
  host: string;
  is_active: boolean;
  max_participants: number;
  is_public: boolean;
  join_code: string;
  participants: SessionParticipant[];
  current_track?: TrackRequest;
  queue: TrackRequest[];
  analytics: SessionAnalytics;
}

export interface SessionParticipant {
  id: string;
  username: string;
  avatar?: string;
  role: "host" | "co_host" | "participant";
  joined_at: string;
  last_active: string;
  is_online: boolean;
}

export interface TrackRequest {
  id: string;
  track_id: string;
  track_title: string;
  track_artist: string;
  requested_by: SessionParticipant;
  requested_at: string;
  status: "pending" | "approved" | "rejected" | "playing" | "played";
  played_at?: string;
  position_in_queue?: number;
  votes: {
    up: number;
    down: number;
  };
  vote_count: number;
}

export interface SessionAnalytics {
  id: string;
  peak_participants: number;
  total_tracks_played: number;
  total_votes: number;
  total_messages: number;
  average_track_rating?: number;
  most_requested_genres: string[];
  participant_engagement: Record<string, any>;
  session_duration?: string;
  engagement_rate: number;
  popular_tracks: Array<{
    track_title: string;
    track_artist: string;
    vote_count: number;
  }>;
}

export interface CreateSessionData {
  name: string;
  max_participants: number;
  is_public: boolean;
  settings?: Record<string, any>;
}

class MultiUserDJService {
  // Session Management
  async createSession(data: CreateSessionData): Promise<DJSession> {
    const response = await axios.post(`${API_BASE_URL}/sessions/`, data);
    return response.data;
  }

  async getSession(sessionId: string): Promise<DJSession> {
    const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}/`);
    return response.data;
  }

  async joinSession(
    sessionId: string,
    joinCode: string,
  ): Promise<SessionParticipant> {
    const response = await axios.post(
      `${API_BASE_URL}/sessions/${sessionId}/join/`,
      {
        join_code: joinCode,
      },
    );
    return response.data;
  }

  async leaveSession(sessionId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/sessions/${sessionId}/leave/`);
  }

  // Track Management
  async requestTrack(
    sessionId: string,
    trackData: {
      track_id: string;
      title: string;
      artist: string;
    },
  ): Promise<TrackRequest> {
    const response = await axios.post(
      `${API_BASE_URL}/sessions/${sessionId}/request_track/`,
      trackData,
    );
    return response.data;
  }

  async voteTrack(
    sessionId: string,
    trackRequestId: string,
    vote: "up" | "down",
  ): Promise<TrackRequest> {
    const response = await axios.post(
      `${API_BASE_URL}/sessions/${sessionId}/vote_track/`,
      {
        track_request_id: trackRequestId,
        vote,
      },
    );
    return response.data;
  }

  async updateTrackStatus(
    trackRequestId: string,
    status: TrackRequest["status"],
  ): Promise<TrackRequest> {
    const response = await axios.post(
      `${API_BASE_URL}/tracks/${trackRequestId}/update_status/`,
      { status },
    );
    return response.data;
  }

  // Participant Management
  async updateParticipantRole(
    participantId: string,
    role: SessionParticipant["role"],
  ): Promise<SessionParticipant> {
    const response = await axios.post(
      `${API_BASE_URL}/participants/${participantId}/update_role/`,
      { role },
    );
    return response.data;
  }

  // Analytics
  async getSessionAnalytics(sessionId: string): Promise<SessionAnalytics> {
    const response = await axios.get(`${API_BASE_URL}/analytics/${sessionId}/`);
    return response.data;
  }

  async getDetailedStats(sessionId: string): Promise<any> {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/${sessionId}/detailed_stats/`,
    );
    return response.data;
  }
}

export const multiUserDJService = new MultiUserDJService();
