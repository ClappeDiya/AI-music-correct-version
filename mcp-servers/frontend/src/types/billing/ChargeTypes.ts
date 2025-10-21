import { BaseEntity } from "./CommonTypes";

export interface Charge extends BaseEntity {
  stripe_charge_id: string;
  amount_cents: number;
  currency: string;
  charge_data: Record<string, any> | null;
}

export interface ChargeCreate {
  payment_method_id: string;
  amount_cents: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ChargeFilter {
  dateFrom?: string;
  dateTo?: string;
  status?: "succeeded" | "pending" | "failed";
  minAmount?: number;
  maxAmount?: number;
}
