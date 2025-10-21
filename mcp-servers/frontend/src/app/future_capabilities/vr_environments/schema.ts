import * as z from "zod";

export const formSchema = z.object({
  environment_name: z.string().min(1, "Environment name is required"),
  spatial_audio_settings: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  haptic_profiles: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  interactive_3d_instruments: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  access_level: z.enum(["public", "private", "shared"]),
});
