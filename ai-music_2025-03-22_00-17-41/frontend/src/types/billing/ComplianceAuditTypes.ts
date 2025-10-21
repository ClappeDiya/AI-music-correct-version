import { BaseEntity } from "./CommonTypes";

export type AuditAction =
  | "encryption_key_rotated"
  | "data_access"
  | "payment_processed"
  | "refund_issued"
  | "settings_changed"
  | "user_access"
  | "api_access";

export interface ComplianceAudit extends BaseEntity {
  action: AuditAction;
  details: Record<string, any>;
  occurred_at: string;
  user_id?: string;
  ip_address?: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface ComplianceAuditCreate {
  action: AuditAction;
  details: Record<string, any>;
  severity: "low" | "medium" | "high" | "critical";
}

export interface ComplianceAuditFilter {
  dateFrom?: string;
  dateTo?: string;
  action?: AuditAction;
  severity?: "low" | "medium" | "high" | "critical";
  userId?: string;
}
