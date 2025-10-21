import axios from "axios";

const API_BASE_URL = "/api/ai_dj/voice_chat";

export interface VoiceChannel {
  id: string;
  session: string;
  name: string;
  created_at: string;
  is_active: boolean;
  ice_servers: RTCIceServer[];
  signaling_url: string;
  participant_count: number;
}

export interface VoiceParticipant {
  id: string;
  channel: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  joined_at: string;
  is_muted: boolean;
  is_speaking: boolean;
  peer_id: string;
}

export interface DJComment {
  id: string;
  session: string;
  comment_type: string;
  comment_type_display: string;
  content: string;
  created_at: string;
  priority: number;
  track_id?: string;
  track_position?: number;
  reaction_count: number;
  was_helpful: boolean;
}

export interface ChatMessage {
  id: string;
  channel: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  content: string;
  created_at: string;
  is_system_message: boolean;
  parent_message?: string;
  replies?: ChatMessage[];
}

class VoiceChatService {
  // Channel management
  async getChannels(sessionId: string): Promise<VoiceChannel[]> {
    const response = await axios.get(`${API_BASE_URL}/channels/`, {
      params: { session_id: sessionId },
    });
    return response.data;
  }

  async joinChannel(
    channelId: string,
    peerId: string,
  ): Promise<VoiceParticipant> {
    const response = await axios.post(
      `${API_BASE_URL}/channels/${channelId}/join/`,
      { peer_id: peerId },
    );
    return response.data;
  }

  async leaveChannel(channelId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/channels/${channelId}/leave/`);
  }

  // Participant management
  async toggleMute(participantId: string): Promise<VoiceParticipant> {
    const response = await axios.post(
      `${API_BASE_URL}/participants/${participantId}/toggle_mute/`,
    );
    return response.data;
  }

  async setSpeaking(
    participantId: string,
    isSpeaking: boolean,
  ): Promise<VoiceParticipant> {
    const response = await axios.post(
      `${API_BASE_URL}/participants/${participantId}/set_speaking/`,
      { is_speaking: isSpeaking },
    );
    return response.data;
  }

  // DJ Comments
  async getRecentComments(sessionId: string): Promise<DJComment[]> {
    const response = await axios.get(
      `${API_BASE_URL}/dj-comments/recent_comments/`,
      {
        params: { session_id: sessionId },
      },
    );
    return response.data;
  }

  async reactToComment(commentId: string): Promise<DJComment> {
    const response = await axios.post(
      `${API_BASE_URL}/dj-comments/${commentId}/react/`,
    );
    return response.data;
  }

  async markCommentHelpful(commentId: string): Promise<DJComment> {
    const response = await axios.post(
      `${API_BASE_URL}/dj-comments/${commentId}/mark_helpful/`,
    );
    return response.data;
  }

  // Chat messages
  async getMessages(channelId: string): Promise<ChatMessage[]> {
    const response = await axios.get(`${API_BASE_URL}/messages/`, {
      params: { channel_id: channelId },
    });
    return response.data;
  }

  async sendMessage(channelId: string, content: string): Promise<ChatMessage> {
    const response = await axios.post(`${API_BASE_URL}/messages/`, {
      channel: channelId,
      content,
    });
    return response.data;
  }

  async replyToMessage(
    messageId: string,
    content: string,
  ): Promise<ChatMessage> {
    const response = await axios.post(
      `${API_BASE_URL}/messages/${messageId}/reply/`,
      { content },
    );
    return response.data;
  }
}

export const voiceChatService = new VoiceChatService();
