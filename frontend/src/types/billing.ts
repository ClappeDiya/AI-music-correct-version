import { z } from "zod";

export const InstallmentPlanSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  frequency: z.enum(["weekly", "bi-weekly", "monthly"]),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
});

export type InstallmentPlan = z.infer<typeof InstallmentPlanSchema>;
