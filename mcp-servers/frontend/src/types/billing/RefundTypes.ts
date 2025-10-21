import { BaseEntity } from "./CommonTypes";

export interface Refund extends BaseEntity {
  stripe_refund_id: string;
  charge_id: string;
  amount_cents: number;
  reason: string | null;
  refund_data: Record<string, any> | null;
}

export interface RefundCreate {
  charge_id: string;
  amount_cents?: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RefundFilter {
  dateFrom?: string;
  dateTo?: string;
  status?: "succeeded" | "pending" | "failed";
  chargeId?: string;
}
