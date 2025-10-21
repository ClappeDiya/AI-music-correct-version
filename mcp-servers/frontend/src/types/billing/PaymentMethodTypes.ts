import { BaseEntity } from "./CommonTypes";

export interface PaymentMethod extends BaseEntity {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_payment_method_id: string | null;
  method_metadata: Record<string, any> | null;
}

export interface PaymentMethodCreate {
  stripe_payment_method_id: string;
  method_metadata?: Record<string, any>;
}

export interface PaymentMethodUpdate {
  method_metadata?: Record<string, any>;
}
