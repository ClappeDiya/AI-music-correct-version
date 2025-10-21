export interface User {
  id: string;
  username: string;
  email: string;
}

export interface TrackFilters {
  license_type?: string;
  genre?: string;
  mood?: string;
  search?: string;
  user_id?: string;
  is_public?: boolean;
}

export interface TrackMetadata {
  duration: number;
  genre: string;
  mood: string;
  bpm: number;
  key: string;
  time_signature: string;
  instruments: string[];
  tags: string[];
  waveform_data: number[];
  preview_url: string;
  preview_start: number;
  preview_end: number;
  recording_date?: string;
  recording_location?: string;
  studio_credits?: string;
  mixing_credits?: string;
  mastering_credits?: string;
  language?: string;
  explicit_content: boolean;
  isrc_code?: string;
}

export interface Track {
  id: string;
  title: string;
  description: string;
  composer_credits: string;
  license_type: string;
  usage_terms: string[];
  royalty_structure: {
    commercial_use: boolean;
    royalty_percentage: number;
    minimum_fee: number;
  };
  metadata: TrackMetadata;
  file_url: string;
  waveform_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_public: boolean;
  download_count: number;
  play_count: number;
}

export interface TrackDetails extends Track {
  composer_details: {
    name: string;
    bio?: string;
    website?: string;
    social_links?: {
      type: string;
      url: string;
    }[];
    other_works?: {
      title: string;
      url: string;
    }[];
  };
  legal_info: {
    copyright_holder: string;
    copyright_year: number;
    rights_holders?: string[];
    disclaimers: string[];
    usage_restrictions: string[];
    territory_restrictions?: string[];
  };
  technical_requirements?: {
    minimum_software_version?: string;
    compatible_daws?: string[];
    sample_rate: number;
    bit_depth: number;
    file_format: string;
    file_size: number;
  };
}

export interface LicenseTerm {
  id: string;
  license_name: string;
  description: string;
  base_conditions: {
    attribution_required?: boolean;
    commercial_use?: boolean;
  };
  created_at: string;
}

export interface TrackLicense {
  id: string;
  track: Track;
  custom_conditions: {
    territory_restrictions?: string[];
    time_limited?: boolean;
  };
  created_at: string;
}

export interface TrackPurchase {
  id: string;
  track: Track;
  buyer: User;
  payment_provider: PaymentProvider;
  amount: number;
  currency: string;
  purchase_details: any;
  purchased_at: string;
}

export interface PaymentProvider {
  id: string;
  provider_name: string;
  provider_details: any;
  active: boolean;
  created_at: string;
}

export interface PaymentProviderNew {
  id: string;
  name: "stripe" | "paypal";
  is_active: boolean;
  config: {
    public_key: string;
    webhook_url: string;
  };
}

export interface TrackDownload {
  id: string;
  track: Track;
  downloader: User;
  download_details: any;
  downloaded_at: string;
}

export interface UsageAgreement {
  id: string;
  track: Track;
  user: User;
  agreement_details: any;
  agreed_at: string;
}

export interface TrackAnalytic {
  id: string;
  track: Track;
  analytics_data: {
    plays: number;
    unique_listeners: number;
    top_countries: string[];
  };
  last_updated: string;
}

export interface RoyaltyTransaction {
  id: string;
  track: Track;
  user: User;
  amount: number;
  transaction_details: {
    month: string;
    total_streams: number;
    rate_per_stream: number;
  };
  processed_at: string;
}

export interface DynamicPricingRule {
  id: string;
  track: Track;
  ruleset: {
    base_price: number;
    demand_factor: number;
    max_price: number;
    volume_thresholds: any[];
  };
  updated_at: string;
}

export interface ExternalUsageLog {
  id: string;
  track: Track;
  source_info: {
    platform: string;
    video_url?: string;
    timestamp: string;
  };
  detected_at: string;
}

export interface BrandedCatalog {
  id: string;
  catalog_name: string;
  branding_details: {
    logo_url?: string;
    color_scheme?: string;
    description?: string;
  };
  created_at: string;
}

export interface BrandedCatalogTrack {
  id: string;
  catalog: BrandedCatalog;
  track: Track;
  featured: boolean;
}

export interface RegionalLegalFramework {
  id: string;
  region_code: string;
  legal_conditions: {
    commercial_use_restrictions?: string[];
    reporting_interval?: string;
  };
  updated_at: string;
}

export interface TrackLegalMapping {
  id: string;
  track: Track;
  framework: RegionalLegalFramework;
  last_synced: string;
}

export interface ConditionalLicenseEscalation {
  id: string;
  track: Track;
  from_license: LicenseTerm;
  to_license: LicenseTerm;
  condition_type: "revenue" | "usage" | "views" | "downloads" | "time";
  condition_value: number;
  current_value?: number;
  notification_threshold?: number;
  is_automatic: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LicensePurchase {
  id: string;
  track_id: string;
  user_id: string;
  license_type: string;
  amount: number;
  currency: string;
  payment_provider: string;
  payment_status: "pending" | "completed" | "failed";
  payment_id: string;
  created_at: string;
  updated_at: string;
  metadata: {
    customer_email?: string;
    customer_name?: string;
    payment_method?: string;
    transaction_id?: string;
  };
}

export interface LicenseTermDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  usage_rights: {
    commercial_use: boolean;
    territory: string[];
    duration: string;
    distribution_limit?: number;
    modifications_allowed: boolean;
    attribution_required: boolean;
  };
  terms_url?: string;
  created_at: string;
  updated_at: string;
}

export interface RoyaltyEarning {
  id: string;
  track_id: string;
  user_id: string;
  amount: number;
  currency: string;
  earning_type: "license_purchase" | "usage_royalty";
  payment_status: "pending" | "paid" | "failed";
  payment_date?: string;
  created_at: string;
  updated_at: string;
  metadata: {
    license_type?: string;
    usage_period?: {
      start: string;
      end: string;
    };
    transaction_id?: string;
  };
}

export interface CreatorStats {
  total_earnings: number;
  currency: string;
  track_stats: {
    total_tracks: number;
    total_plays: number;
    total_downloads: number;
    total_licenses_sold: number;
  };
  earnings_by_period: {
    period: string;
    amount: number;
  }[];
  popular_tracks: {
    track_id: string;
    title: string;
    plays: number;
    downloads: number;
    earnings: number;
  }[];
  license_tiers: {
    tier_id: string;
    name: string;
    total_sales: number;
    total_earnings: number;
  }[];
}

export interface LicenseTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  usage_rights: {
    commercial_use: boolean;
    territory: string[];
    duration: string;
    distribution_limit?: number;
    modifications_allowed: boolean;
    attribution_required: boolean;
  };
  royalty_rate: number;
  minimum_fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrackAnalytics {
  track_id: string;
  period: string;
  metrics: {
    views: number;
    unique_visitors: number;
    downloads: number;
    plays: number;
    average_play_duration: number;
    completion_rate: number;
    licenses_sold: {
      type: string;
      count: number;
      revenue: number;
    }[];
    revenue: {
      total: number;
      by_license: {
        [key: string]: number;
      };
      by_territory: {
        [key: string]: number;
      };
    };
    geographic_distribution: {
      country: string;
      views: number;
      downloads: number;
      revenue: number;
    }[];
    referral_sources: {
      source: string;
      count: number;
      conversion_rate: number;
    }[];
    user_engagement: {
      date: string;
      views: number;
      downloads: number;
      plays: number;
    }[];
  };
}

export interface AdvancedTrackAnalytics extends TrackAnalytics {
  metrics: {
    views: number;
    unique_visitors: number;
    downloads: number;
    plays: number;
    average_play_duration: number;
    completion_rate: number;
    licenses_sold: {
      type: string;
      count: number;
      revenue: number;
    }[];
    revenue: {
      total: number;
      by_license: { [key: string]: number };
      by_territory: { [key: string]: number };
    };
    geographic_distribution: {
      country: string;
      views: number;
      downloads: number;
      revenue: number;
    }[];
    referral_sources: {
      source: string;
      count: number;
      conversion_rate: number;
    }[];
    user_engagement: {
      date: string;
      views: number;
      downloads: number;
      plays: number;
    }[];
    engagement_metrics: {
      skip_rate: number;
      replay_rate: number;
      average_session_duration: number;
      peak_listening_hours: { hour: number; count: number }[];
      device_breakdown: { device: string; percentage: number }[];
      platform_distribution: { platform: string; percentage: number }[];
    };
    conversion_metrics: {
      visit_to_play_rate: number;
      play_to_download_rate: number;
      download_to_license_rate: number;
      average_time_to_conversion: number;
    };
    social_metrics: {
      shares: number;
      playlists_added: number;
      favorites: number;
      comments: number;
    };
    comparative_metrics: {
      genre_rank: number;
      total_tracks_in_genre: number;
      percentile: number;
      trend_direction: "up" | "down" | "stable";
      trend_percentage: number;
    };
  };
}

export interface AnalyticsExportOptions {
  format: "csv" | "pdf" | "excel" | "json" | "xml";
  dateRange: {
    start: string;
    end: string;
  };
  metrics: string[];
  groupBy?: "hour" | "day" | "week" | "month" | "quarter" | "year";
  trackIds?: string[];
  includeComparative?: boolean;
  customization?: {
    charts?: boolean;
    branding?: boolean;
    executive_summary?: boolean;
  };
}

export interface RealTimeAnalytics {
  timestamp: string;
  concurrent_listeners: number;
  active_sessions: number;
  current_tracks_playing: {
    track_id: string;
    title: string;
    listeners: number;
    trend: number;
  }[];
  geographic_hotspots: {
    country: string;
    city: string;
    listeners: number;
  }[];
  live_events: {
    type: "play" | "download" | "license" | "share";
    track_id: string;
    timestamp: string;
    location?: string;
  }[];
}

export interface LicenseAgreement {
  id: string;
  user_id: string;
  track_id: string;
  license_type: string;
  agreement_version: string;
  status: "pending" | "signed" | "expired" | "revoked";
  signed_at?: string;
  expires_at?: string;
  terms_accepted: boolean;
  signature_data?: {
    signature_image?: string;
    ip_address: string;
    user_agent: string;
    timestamp: string;
  };
  metadata: {
    user: {
      name: string;
      email: string;
      company?: string;
      address?: string;
    };
    track: {
      title: string;
      composer: string;
      duration: number;
      genre: string;
    };
    license: {
      type: string;
      fee: number;
      usage_rights: string[];
      restrictions: string[];
      territory: string[];
      duration: string;
    };
  };
  document_urls: {
    pdf: string;
    html: string;
    signed_copy?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface LicenseHistory {
  user_id: string;
  agreements: {
    active: LicenseAgreement[];
    expired: LicenseAgreement[];
    pending: LicenseAgreement[];
  };
  stats: {
    total_licenses: number;
    active_licenses: number;
    total_spent: number;
    most_licensed_genre: string;
  };
}

export interface LicenseCustomization {
  branding: {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
    company_name?: string;
    company_website?: string;
  };
  template: {
    header_text?: string;
    footer_text?: string;
    custom_clauses?: Array<{
      title: string;
      content: string;
      position: number;
    }>;
    language: string;
    jurisdiction: string;
  };
  usage_terms: {
    territories: string[];
    duration: string;
    distribution_channels: string[];
    monetization_allowed: boolean;
    attribution_required: boolean;
    modification_rights: "none" | "limited" | "full";
    exclusivity: boolean;
    sub_licensing_allowed: boolean;
  };
}

export interface SignatureVerification {
  signature_id: string;
  verification_method: "email" | "phone" | "id_document" | "blockchain";
  verification_status: "pending" | "verified" | "failed";
  verification_timestamp?: string;
  verification_provider?: string;
  verification_details: {
    method_specific_data: Record<string, any>;
    identity_proof?: {
      type: string;
      issuer: string;
      reference_number: string;
      expiry_date?: string;
    };
    blockchain_proof?: {
      transaction_hash: string;
      block_number: number;
      timestamp: string;
      network: string;
    };
  };
  audit_trail: Array<{
    action: string;
    timestamp: string;
    ip_address: string;
    user_agent: string;
    location?: {
      country: string;
      city: string;
      coordinates?: [number, number];
    };
  }>;
}

export interface LicenseAnalytics {
  overview: {
    total_revenue: number;
    active_licenses: number;
    pending_verifications: number;
    expiring_soon: number;
    revenue_by_type: Record<string, number>;
    licenses_by_territory: Record<string, number>;
  };
  usage_patterns: {
    popular_terms: string[];
    common_modifications: string[];
    territory_heat_map: Array<{
      country: string;
      value: number;
      growth_rate: number;
    }>;
    peak_purchase_times: Array<{
      hour: number;
      day: string;
      count: number;
    }>;
  };
  compliance: {
    verification_success_rate: number;
    average_verification_time: number;
    common_rejection_reasons: string[];
    risk_factors: Array<{
      factor: string;
      risk_level: "low" | "medium" | "high";
      occurrence: number;
    }>;
  };
  revenue: {
    monthly_revenue: Array<{
      month: string;
      revenue: number;
      license_count: number;
    }>;
    revenue_by_genre: Record<string, number>;
    average_license_value: number;
    recurring_revenue: number;
  };
  user_behavior: {
    average_decision_time: number;
    abandonment_rate: number;
    popular_customizations: string[];
    preferred_verification_methods: Record<string, number>;
  };
}

export interface DisputeCase {
  id: string;
  case_number: string;
  status: "open" | "under_review" | "resolved" | "appealed" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  type:
    | "copyright_infringement"
    | "license_breach"
    | "content_violation"
    | "other";
  submitted_by: string;
  submitted_at: string;
  last_updated: string;
  resolved_at?: string;
  track_id: string;
  respondent_id: string;
  assigned_moderator?: string;

  details: {
    title: string;
    description: string;
    evidence_urls: string[];
    related_license_ids: string[];
    additional_notes?: string;
  };

  timeline: Array<{
    action: string;
    timestamp: string;
    actor_id: string;
    actor_type: "user" | "moderator" | "system" | "admin";
    details: string;
    attachments?: string[];
  }>;

  resolution?: {
    outcome: "upheld" | "rejected" | "partial" | "settled";
    decision_summary: string;
    actions_taken: string[];
    appeal_deadline?: string;
    sanctions_applied?: string[];
    compensation_required?: {
      amount: number;
      currency: string;
      due_date: string;
    };
  };

  communication: Array<{
    id: string;
    sender_id: string;
    sender_type: "user" | "moderator" | "system" | "admin";
    message: string;
    timestamp: string;
    attachments?: string[];
    read_by: string[];
  }>;
}

export interface ModerationAction {
  id: string;
  case_id: string;
  moderator_id: string;
  action_type: "warning" | "takedown" | "ban" | "restrict" | "reinstate";
  timestamp: string;
  reason: string;
  details: string;
  evidence?: string[];
  duration?: string;
  appeal_allowed: boolean;
  notification_sent: boolean;
}

export interface DisputeNotification {
  id: string;
  user_id: string;
  case_id: string;
  type: "case_update" | "message" | "resolution" | "appeal" | "warning";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_required: boolean;
  action_deadline?: string;
  priority: "low" | "medium" | "high" | "urgent";
  metadata: {
    case_number: string;
    track_title?: string;
    action_type?: string;
    resolution_type?: string;
  };
}

export interface ModerationDashboardStats {
  overview: {
    total_cases: number;
    open_cases: number;
    resolved_cases: number;
    average_resolution_time: number;
    cases_by_type: Record<string, number>;
    cases_by_priority: Record<string, number>;
  };
  trends: {
    daily_cases: Array<{
      date: string;
      count: number;
      type_breakdown: Record<string, number>;
    }>;
    resolution_rates: {
      upheld_percentage: number;
      rejected_percentage: number;
      settlement_percentage: number;
    };
    common_violations: Array<{
      type: string;
      count: number;
      trend: "increasing" | "decreasing" | "stable";
    }>;
  };
  moderator_performance: Array<{
    moderator_id: string;
    cases_handled: number;
    average_resolution_time: number;
    satisfaction_rating: number;
    case_outcomes: Record<string, number>;
  }>;
}

// Feature Flag Types
export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  status: "active" | "inactive" | "scheduled" | "archived";
  created_at: string;
  updated_at: string;
  created_by: User;
  environment: "development" | "staging" | "production";
  percentage_rollout: number;
  user_segments: string[];
  geographic_regions: string[];
  device_types: string[];
  start_date?: string;
  end_date?: string;
  dependencies: string[];
  rules: {
    operator: "and" | "or";
    conditions: Array<{
      property: string;
      comparison:
        | "equals"
        | "not_equals"
        | "contains"
        | "greater_than"
        | "less_than";
      value: any;
    }>;
  };
  is_monitored: boolean;
  alert_threshold?: number;
}

export interface FeatureMetrics {
  id: string;
  feature: string;
  timestamp: string;
  impressions: number;
  activations: number;
  errors: number;
  latency_ms: number;
  error_rate: number;
  activation_rate: number;
}

export interface FeatureAuditLog {
  id: string;
  feature: string;
  user: string;
  action: "create" | "update" | "delete" | "enable" | "disable";
  timestamp: string;
  changes: Record<string, any>;
}

export interface UserFeedback {
  id: string;
  user: string;
  generated_track: string;
  feedback_type: "like" | "dislike" | "tweak";
  rating?: number;
  feedback_text?: string;
  context?: Record<string, any>;
  created_at: string;
}

export interface UserPreference {
  id: string;
  user: string;
  genre_weights: Record<string, number>;
  instrument_weights: Record<string, number>;
  style_weights: Record<string, number>;
  complexity_preference: number;
  tempo_preference: number;
  feedback_count: number;
  confidence_scores: Record<string, number>;
  last_updated: string;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  variant_configs: Record<string, any>;
  total_impressions: number;
  variant_metrics: Record<
    string,
    {
      impressions: number;
      conversions: number;
    }
  >;
}

export interface ABTestResults {
  [variant: string]: {
    impressions: number;
    conversions: number;
    conversion_rate: number;
    confidence_interval: [number, number];
  };
}
