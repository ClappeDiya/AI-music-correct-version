import * as z from "zod";

export const formSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  profile_name: z.string().min(1, "Profile name is required"),
  style_type: z.enum(["classical", "jazz", "electronic", "rock", "custom"]),
  preferences: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  instrument_settings: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  visualization_settings: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  is_active: z.boolean().default(true),
  learning_parameters: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
});
