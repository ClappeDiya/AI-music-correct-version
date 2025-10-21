import * as z from "zod";

export const formSchema = z.object({
  service_name: z.string().min(1, "Service name is required"),
  description: z.string().min(1, "Description is required"),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Version must be in semver format (e.g., 1.0.0)"),
  status: z.enum(["active", "inactive", "deprecated", "development"]),
  security_classification: z.enum([
    "public",
    "internal",
    "confidential",
    "restricted",
  ]),
  endpoints: z
    .array(
      z.object({
        path: z.string(),
        method: z.string(),
        description: z.string(),
      }),
    )
    .optional()
    .transform((val) => val || []),
  dependencies: z
    .array(z.string())
    .optional()
    .transform((val) => val || []),
  performance_metrics: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  deployment_config: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
});
