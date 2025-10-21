// Base interface for all models
export interface BaseModel {
  id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface VREnvironmentConfig extends BaseModel {
  environment_name: string;
  spatial_audio_settings?: Record<string, any>;
  haptic_profiles?: Record<string, any>;
  interactive_3d_instruments?: Record<string, any>;
  access_level: "public" | "private" | "shared";
}

export interface CollaborationSession extends BaseModel {
  session_name: string;
  participant_user_ids?: number[];
  track_ref?: string;
  active: boolean;
  session_type: "public" | "private" | "invite_only";
  moderators?: number[];
}

export interface CollaborationActivityLog extends BaseModel {
  session: number;
  user_id?: number;
  action_detail: string;
  action_type: "join" | "leave" | "edit" | "comment" | "moderate";
}

export interface AIPluginRegistry extends BaseModel {
  plugin_name: string;
  plugin_description?: string;
  plugin_parameters?: Record<string, any>;
  version: string;
  access_level: "public" | "private" | "restricted";
  approved: boolean;
}

export interface UserStyleProfile extends BaseModel {
  user: number;
  style_data: Record<string, any>;
  privacy_level: string;
}

export interface DeviceIntegrationConfig extends BaseModel {
  user: number;
  device_type: string;
  device_metadata?: Record<string, any>;
  status: "active" | "inactive" | "pending";
  security_level: "low" | "medium" | "high";
}

export interface BiofeedbackDataLog extends BaseModel {
  user: number;
  data_points?: Record<string, any>;
  data_type:
    | "heart_rate"
    | "brain_wave"
    | "muscle_tension"
    | "galvanic_response";
  privacy_level: "private" | "research" | "anonymous";
}

export interface ThirdPartyIntegration extends BaseModel {
  partner_name: string;
  integration_details?: Record<string, any>;
  integration_type: "api" | "oauth" | "webhook" | "data_sync";
  status: "active" | "inactive" | "pending" | "suspended";
  security_level: "standard" | "enhanced" | "critical";
}

export interface MiniAppRegistry extends BaseModel {
  app_name: string;
  developer: number;
  app_description?: string;
  capabilities?: Record<string, any>;
  status: "draft" | "pending_review" | "approved" | "rejected" | "deprecated";
  security_audit_status: "pending" | "passed" | "failed" | "exempted";
  access_level: "public" | "private" | "beta";
}

export interface UserFeedbackLog extends BaseModel {
  user: number;
  feedback_type:
    | "feature_request"
    | "bug_report"
    | "improvement"
    | "security_concern";
  feedback_content: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "new" | "under_review" | "in_progress" | "resolved" | "closed";
}

export interface FeatureRoadmap extends BaseModel {
  feature_name: string;
  status:
    | "proposed"
    | "planned"
    | "in_development"
    | "beta"
    | "released"
    | "deprecated";
  influence_data?: Record<string, any>;
  priority_level: "low" | "medium" | "high" | "critical";
  visibility: "public" | "private" | "beta_users";
}

export interface MicroserviceRegistry extends BaseModel {
  service_name: string;
  service_config?: Record<string, any>;
  status: "active" | "inactive" | "maintenance" | "deprecated";
  security_classification: "public" | "internal" | "restricted" | "critical";
  health_check_enabled: boolean;
}

export interface MicrofluidicInstrumentConfig extends BaseModel {
  instrument_name: string;
  fluidic_params?: Record<string, any>;
  hybrid_control_mappings?: Record<string, any>;
  operational_status:
    | "calibrating"
    | "ready"
    | "in_use"
    | "maintenance"
    | "error";
  access_level: "trainee" | "operator" | "expert" | "admin";
}

export interface DimensionalityModel extends BaseModel {
  model_name: string;
  model_parameters?: Record<string, any>;
  data_source_ref?: string;
  status: "development" | "testing" | "production" | "deprecated";
  access_level: "public" | "internal" | "restricted";
}

export interface AIAgentPartnership extends BaseModel {
  agent_name: string;
  personality_profile?: Record<string, any>;
  associated_task?: string;
  status: string;
  security_clearance: string;
  expiration_time?: string;
}

export interface SynestheticMapping extends BaseModel {
  mapping_name: string;
  sensory_correlations?: Record<string, any>;
  mapping_type: string;
  validation_status: string;
  access_scope: string;
}

export interface SemanticLayer extends BaseModel {
  layer_name: string;
  abstract_concepts?: Record<string, any>;
  layer_type: string;
  complexity_level: string;
  access_mode: string;
}

export interface PipelineEvolutionLog extends BaseModel {
  pipeline_name: string;
  performance_metrics?: Record<string, any>;
  suggested_optimizations?: Record<string, any>;
  evolution_stage: string;
  criticality_level: string;
}

export interface InterstellarLatencyConfig extends BaseModel {
  scenario_name: string;
  latency_parameters?: Record<string, any>;
  scenario_type: string;
  reliability_rating: string;
  security_protocol: string;
}
