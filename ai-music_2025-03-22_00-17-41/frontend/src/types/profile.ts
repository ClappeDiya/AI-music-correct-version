export interface Profile {
  id: string;
  name: string;
  profile_type: "CASUAL" | "PRO" | "CUSTOM";
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
