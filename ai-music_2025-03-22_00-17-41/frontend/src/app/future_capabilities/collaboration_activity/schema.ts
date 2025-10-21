import * as z from "zod";

export const formSchema = z.object({
  session: z.string().min(1, "Session ID is required"),
  user_id: z.string().min(1, "User ID is required"),
  action_type: z.enum(["join", "leave", "message", "edit", "share", "control"]),
  action_detail: z.string().min(1, "Action detail is required"),
  timestamp: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
      "Timestamp must be in ISO format",
    )
    .default(() => new Date().toISOString()),
  metadata: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
});
