import * as z from "zod";

export const formSchema = z.object({
  session_name: z.string().min(1, "Session name is required"),
  participant_user_ids: z
    .array(z.string())
    .optional()
    .transform((val) => val || []),
  moderators: z
    .array(z.string())
    .optional()
    .transform((val) => val || []),
  session_config: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  active: z.enum(["true", "false"]).transform((val) => val === "true"),
});
