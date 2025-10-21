// VR Types
export interface VREnvironment {
  id: string;
  name: string;
  description: string;
  owner: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  configuration: Record<string, any>;
}

export interface VRInteraction {
  id: string;
  session_id: string;
  interaction_type: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface VRPosition {
  x: number;
  y: number;
  z: number;
}

export interface VRRotation {
  x: number;
  y: number;
  z: number;
}

// Neural Interface Types
export interface NeuralDevice {
  id: string;
  name: string;
  device_type: string;
  status: "connected" | "disconnected" | "calibrating";
  user: string;
  settings: Record<string, any>;
}

export interface NeuralSignal {
  id: string;
  device_id: string;
  signal_type: string;
  signal_data: Record<string, any>;
  timestamp: string;
}

export interface NeuralControl {
  id: string;
  device_id: string;
  control_type: string;
  mapping_data: Record<string, any>;
  is_active: boolean;
}

// Plugin Types
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  developer_id: string;
  is_certified: boolean;
  installation_count: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface PluginDeveloper {
  id: string;
  user_id: string;
  company_name: string;
  is_verified: boolean;
  website?: string;
  contact_email: string;
}

export interface PluginInstallation {
  id: string;
  plugin_id: string;
  user_id: string;
  status: "installed" | "uninstalled" | "failed";
  settings: Record<string, any>;
  installed_at: string;
}

export interface PluginRating {
  id: string;
  plugin_id: string;
  user_id: string;
  rating: number;
  review?: string;
  created_at: string;
}

// Analytics Types
export interface FeatureAnalytics {
  id: string;
  feature_name: string;
  usage_count: number;
  success_rate: number;
  average_duration: number;
  user_satisfaction: number;
  timestamp: string;
}

export interface FeatureSurvey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  is_active: boolean;
  start_date: string;
  end_date?: string;
}

export interface SurveyQuestion {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "text" | "rating";
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  user_id: string;
  responses: Record<string, any>;
  submitted_at: string;
}

// Biofeedback Types
export interface BiofeedbackData {
  id: string;
  device_id: string;
  data_type: string;
  data_points: Record<string, any>;
  timestamp: string;
}

export interface BiofeedbackEvent {
  id: string;
  device_id: string;
  event_type: string;
  event_data: Record<string, any>;
  timestamp: string;
}
