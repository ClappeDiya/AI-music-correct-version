import { z } from "zod";
import {
  PricingCondition,
  PricingAdjustment,
  DynamicPricingRule,
} from "@/types/billing/DynamicPricing.types";

export function isPricingCondition(value: unknown): value is PricingCondition {
  const schema = z.object({
    type: z.enum(["time", "volume", "user_segment", "location", "custom"]),
    operator: z.enum(["equals", "greater_than", "less_than", "between", "in"]),
    value: z.any(),
    parameters: z.record(z.any()).optional(),
  });

  return schema.safeParse(value).success;
}

export function isPricingAdjustment(
  value: unknown,
): value is PricingAdjustment {
  const schema = z.object({
    type: z.enum(["percentage", "fixed_amount", "override"]),
    value: z.number(),
    currency: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
  });

  return schema.safeParse(value).success;
}

export function isDynamicPricingRule(
  value: unknown,
): value is DynamicPricingRule {
  const schema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    conditions: z
      .array(z.any())
      .refine(
        (conditions) => conditions.every(isPricingCondition),
        "Invalid conditions array",
      ),
    adjustments: z
      .array(z.any())
      .refine(
        (adjustments) => adjustments.every(isPricingAdjustment),
        "Invalid adjustments array",
      ),
    priority: z.number(),
    active: z.boolean(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  });

  return schema.safeParse(value).success;
}
