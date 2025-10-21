import * as z from "zod";

export const formSchema = z.object({
  agent_name: z.string().min(1, "Agent name is required"),
  associated_task: z.string().optional(),
  personality_profile: z.record(z.any()).optional(),
  status: z.enum(["active", "training", "suspended", "retired"]),
  security_clearance: z.enum(["basic", "enhanced", "advanced", "maximum"]),
  expiration_time: z.string().optional(),
});
