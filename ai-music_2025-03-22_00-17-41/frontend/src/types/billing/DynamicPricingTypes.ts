import { BaseEntity } from "./CommonTypes";

export type PricingCondition = {
  type: "time" | "volume" | "user_segment" | "location" | "custom";
  operator: "equals" | "greater_than" | "less_than" | "between" | "in";
  value: any;
  parameters?: Record<string, any>;
};

export type PricingAdjustment = {
  type: "percentage" | "fixed_amount" | "override";
  value: number;
  currency?: string;
  minPrice?: number;
  maxPrice?: number;
};

export interface DynamicPricingRule extends BaseEntity {
  name: string;
  description?: string;
  conditions: PricingCondition[];
  adjustments: PricingAdjustment[];
  priority: number;
  active: boolean;
  start_date?: string;
  end_date?: string;
  rule_data: Record<string, any>;
}

export interface DynamicPricingRuleCreate {
  name: string;
  description?: string;
  conditions: PricingCondition[];
  adjustments: PricingAdjustment[];
  priority: number;
  active: boolean;
  start_date?: string;
  end_date?: string;
  rule_data?: Record<string, any>;
}

export interface DynamicPricingRuleUpdate
  extends Partial<DynamicPricingRuleCreate> {
  id: string;
}

export interface DynamicPricingFilter {
  active?: boolean;
  priority?: number;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}
