import * as z from "zod";

export const formSchema = z.object({
  mapping_name: z.string().min(1, "Mapping name is required"),
  sensory_correlations: z.record(z.any()).optional(),
  mapping_type: z.enum([
    "visual_audio",
    "audio_tactile",
    "color_emotion",
    "custom",
  ]),
  validation_status: z.enum([
    "pending",
    "validated",
    "experimental",
    "rejected",
  ]),
  access_scope: z.enum(["global", "personal", "shared"]),
});
