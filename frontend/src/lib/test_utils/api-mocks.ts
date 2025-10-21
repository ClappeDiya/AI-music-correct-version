import { rest } from "msw";
import { setupServer } from "msw/node";
import { DynamicPricingRule } from "@/types/billing/DynamicPricing.types";

export const createMockRule = (overrides = {}): DynamicPricingRule => ({
  id: "test-rule-1",
  name: "Test Rule",
  conditions: [
    {
      type: "time",
      operator: "between",
      value: ["2023-01-01", "2024-01-01"],
    },
  ],
  adjustments: [
    {
      type: "percentage",
      value: 10,
      currency: "USD",
    },
  ],
  priority: 1,
  active: true,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
  ...overrides,
});

export const handlers = [
  rest.get("/api/dynamic-pricing-rules", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([createMockRule(), createMockRule({ id: "test-rule-2" })]),
    );
  }),

  rest.post("/api/dynamic-pricing-rules/:id/simulate", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        originalPrice: 100,
        adjustedPrice: 90,
        appliedRules: ["Test Rule"],
        currency: "USD",
      }),
    );
  }),
];

export const server = setupServer(...handlers);
