export interface Genre {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MixingSessionGenre {
  id: string;
  session: string;
  genre: Genre;
  weight: number;
}

export interface MixingSessionParams {
  id: string;
  session: string;
  parameters: {
    instrument_balance?: { [key: string]: number };
    effects?: { [key: string]: any };
    energy_level?: number;
    tempo?: number;
    key?: string;
    [key: string]: any;
  };
  created_at: string;
}

export interface MixingOutput {
  id: string;
  session: string;
  audio_file_url?: string;
  notation_data?: {
    chords: string[];
    key: string;
    tempo: number;
    time_signature: string;
    [key: string]: any;
  };
  waveform_data?: {
    peaks: number[];
    duration: number;
    sample_rate: number;
    [key: string]: any;
  };
  created_at: string;
  finalization_timestamp?: string;
}

export interface MixingSession {
  id: string;
  user: {
    id: string;
    username: string;
  };
  session_name?: string;
  status: "in_progress" | "completed";
  created_at: string;
  updated_at: string;
  session_genres: MixingSessionGenre[];
  session_params: MixingSessionParams[];
  mixing_outputs: MixingOutput[];
}
