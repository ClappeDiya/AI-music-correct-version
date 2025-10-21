import * as z from "zod";

export const formSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  feedback_type: z.enum([
    "bug_report",
    "feature_request",
    "improvement",
    "general",
    "performance",
    "ui_ux",
  ]),
  feedback_content: z.string().min(1, "Feedback content is required"),
  satisfaction_rating: z.enum(["1", "2", "3", "4", "5"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["new", "in_review", "in_progress", "resolved", "closed"]),
  attachments: z
    .array(z.string())
    .optional()
    .transform((val) => val || []),
  metadata: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
});
