import * as z from "zod";

export const formSchema = z.object({
  integration_name: z.string().min(1, "Integration name is required"),
  provider: z.string().min(1, "Provider name is required"),
  integration_type: z.enum([
    "authentication",
    "storage",
    "analytics",
    "payment",
    "communication",
    "ai_service",
  ]),
  status: z.enum(["active", "inactive", "error", "pending"]),
  api_configuration: z
    .record(z.any())
    .refine(
      (val) => Object.keys(val).length > 0,
      "API configuration is required",
    ),
  data_mapping: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  permissions: z
    .array(z.string())
    .optional()
    .transform((val) => val || []),
  sync_settings: z
    .object({
      enabled: z.boolean().default(true),
      interval: z.number().optional(),
      last_sync: z.string().optional(),
    })
    .optional()
    .transform((val) => val || { enabled: true }),
});
