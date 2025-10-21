import * as z from "zod";

export const formSchema = z.object({
  partner_name: z.string().min(1, "Partner name is required"),
  partnership_type: z.enum([
    "research",
    "commercial",
    "open_source",
    "educational",
    "government",
  ]),
  status: z.enum(["active", "pending", "suspended", "terminated"]),
  description: z.string().min(1, "Description is required"),
  capabilities: z
    .array(z.string())
    .min(1, "At least one capability is required")
    .transform((val) => val || []),
  integration_details: z
    .object({
      status: z.enum(["connected", "partial", "disconnected"]),
      api_version: z.string().optional(),
      endpoints: z.array(z.string()).optional(),
      authentication: z.record(z.any()).optional(),
    })
    .optional()
    .transform((val) => val || { status: "disconnected" }),
  performance_metrics: z
    .object({
      score: z.number().min(0).max(100).optional(),
      response_time: z.number().optional(),
      accuracy: z.number().optional(),
      reliability: z.number().optional(),
      last_evaluated: z.string().optional(),
    })
    .optional()
    .transform((val) => val || {}),
  compliance_info: z
    .object({
      compliant: z.boolean(),
      certifications: z.array(z.string()).optional(),
      last_audit: z.string().optional(),
      requirements: z.record(z.any()).optional(),
    })
    .optional()
    .transform((val) => val || { compliant: false }),
  resource_allocation: z
    .object({
      compute: z.record(z.any()).optional(),
      storage: z.record(z.any()).optional(),
      bandwidth: z.record(z.any()).optional(),
      cost: z.record(z.any()).optional(),
    })
    .optional()
    .transform((val) => val || {}),
});
