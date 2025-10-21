export type Role = "admin" | "contributor" | "viewer";
export type TrainingStatus = "pending" | "training" | "ready" | "failed";
export type ContributionStatus = "pending" | "approved" | "rejected";
export type JobStatus = "queued" | "running" | "completed" | "failed";

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface SharedModelMember {
  id: number;
  group: number;
  user: User;
  role: Role;
  joined_at: string;
  contribution_count: number;
}

export interface TrainingContribution {
  id: number;
  group: number;
  contributor: SharedModelMember;
  composition: any; // Replace with proper Composition type
  contributed_at: string;
  status: ContributionStatus;
  review_notes: string;
  training_metadata: Record<string, any>;
}

export interface ModelTrainingJob {
  id: number;
  group: number;
  started_at: string;
  completed_at: string | null;
  status: JobStatus;
  error_message: string;
  training_metrics: Record<string, any>;
  model_artifacts: Record<string, string>;
}

export interface SharedModelGroup {
  id: number;
  name: string;
  description: string;
  created_by: User;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  training_status: TrainingStatus;
  model_version: number;
  style_tags: string[];
  training_config: Record<string, any>;
  members: SharedModelMember[];
  member_count: number;
  recent_contributions?: TrainingContribution[];
  latest_training_job?: ModelTrainingJob;
}
