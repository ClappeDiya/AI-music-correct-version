import * as z from "zod";

export const formSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  session_id: z.string().min(1, "Session ID is required"),
  data_type: z.enum([
    "heart_rate",
    "eeg",
    "gsr",
    "emg",
    "motion",
    "respiratory",
  ]),
  timestamp: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
      "Timestamp must be in ISO format",
    )
    .default(() => new Date().toISOString()),
  data_value: z
    .record(z.any())
    .refine((val) => Object.keys(val).length > 0, "Data value is required"),
  quality_metrics: z
    .record(z.number())
    .optional()
    .transform((val) => val || { quality: 1.0 }),
  device_info: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  analysis_results: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
});
