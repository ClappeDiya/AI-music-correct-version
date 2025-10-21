export interface UserSettings {
  id: string;
  user: string;
  preferences: {
    theme: string;
    notifications: boolean;
    language: string;
    timezone: string;
  };
  device_specific_settings: Record<string, any>;
  last_updated: string;
}

export interface UserProfile {
  id: string;
  user: string;
  profile_type: "CASUAL" | "PRO" | "CUSTOM";
  name: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProfileType = "CASUAL" | "PRO" | "CUSTOM";

export interface Overlay {
  id: string;
  name: string;
  trigger_conditions: Record<string, any>;
  active: boolean;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProfileHistory {
  id: string;
  user: string;
  profile: string;
  version: number;
  settings_snapshot: Record<string, any>;
  created_at: string;
  updated_at: string;
}
