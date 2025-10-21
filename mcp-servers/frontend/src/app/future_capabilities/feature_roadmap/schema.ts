import * as z from "zod";

export const formSchema = z.object({
  feature_name: z.string().min(1, "Feature name is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["planned", "in_progress", "completed", "on_hold"]),
  priority_level: z.enum(["low", "medium", "high", "critical"]),
  target_release_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  visibility: z.enum(["public", "internal", "confidential"]),
  technical_requirements: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  dependencies: z
    .array(z.string())
    .optional()
    .transform((val) => val || []),
});
