import * as z from "zod";

export const formSchema = z.object({
  app_name: z.string().min(1, "App name is required"),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Version must be in semver format (e.g., 1.0.0)"),
  app_type: z.enum([
    "visualization",
    "audio_effect",
    "instrument",
    "analysis",
    "utility",
    "game",
  ]),
  status: z.enum(["active", "inactive", "development", "deprecated"]),
  description: z.string().min(1, "Description is required"),
  entry_points: z
    .record(z.any())
    .refine(
      (val) => Object.keys(val).length > 0,
      "At least one entry point is required",
    ),
  dependencies: z
    .record(z.string())
    .optional()
    .transform((val) => val || {}),
  permissions: z
    .array(z.string())
    .optional()
    .transform((val) => val || []),
  configuration: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
});
