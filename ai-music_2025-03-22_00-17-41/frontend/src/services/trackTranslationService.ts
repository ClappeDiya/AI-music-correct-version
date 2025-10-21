import axios from "axios";
import { API_BASE_URL } from "../config";

export interface TrackTranslation {
  language_code: string;
  title: string;
  artist?: string;
  album?: string;
  description?: string;
}

export interface TrackLyrics {
  language_code: string;
  is_original: boolean;
  lyrics_text: string;
  lyrics_with_timestamps?: Array<{
    start_time: number;
    end_time: number;
    text: string;
  }>;
  translation_source?: string;
  verified: boolean;
  snippet: string;
}

class TrackTranslationService {
  async getTrackTranslations(trackId: number): Promise<TrackTranslation[]> {
    const response = await axios.get(
      `${API_BASE_URL}/tracks/${trackId}/translations/`,
    );
    return response.data;
  }

  async getTrackLyrics(
    trackId: number,
    language?: string,
  ): Promise<TrackLyrics> {
    const url = `${API_BASE_URL}/tracks/${trackId}/lyrics/`;
    const params = language ? { language } : {};
    const response = await axios.get(url, { params });
    return response.data;
  }

  async addTranslation(
    trackId: number,
    translation: TrackTranslation,
  ): Promise<TrackTranslation> {
    const response = await axios.post(
      `${API_BASE_URL}/tracks/${trackId}/add_translation/`,
      translation,
    );
    return response.data;
  }

  async addLyrics(
    trackId: number,
    lyrics: Omit<TrackLyrics, "snippet">,
  ): Promise<TrackLyrics> {
    const response = await axios.post(
      `${API_BASE_URL}/tracks/${trackId}/add_lyrics/`,
      lyrics,
    );
    return response.data;
  }

  async getTrackWithTranslation(trackId: number, language: string) {
    const response = await axios.get(`${API_BASE_URL}/tracks/${trackId}/`, {
      params: { language },
    });
    return response.data;
  }
}

export const trackTranslationService = new TrackTranslationService();
