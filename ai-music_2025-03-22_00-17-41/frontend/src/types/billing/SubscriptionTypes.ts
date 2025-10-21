import { BaseEntity } from "./CommonTypes";

export interface Subscription extends BaseEntity {
  stripe_subscription_id: string;
  plan_reference: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  subscription_data: Record<string, any> | null;
}

export interface SubscriptionCreate {
  plan_id: string;
  payment_method_id: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionUpdate {
  plan_id?: string;
  payment_method_id?: string;
  metadata?: Record<string, any>;
}
