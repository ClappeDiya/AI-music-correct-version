import * as z from "zod";

export const formSchema = z.object({
  pipeline_id: z.string().min(1, "Pipeline ID is required"),
  evolution_type: z.enum([
    "architecture",
    "parameter",
    "optimization",
    "error_recovery",
    "feature",
    "security",
  ]),
  status: z.enum(["completed", "in_progress", "failed", "rolled_back"]),
  description: z.string().min(1, "Description is required"),
  changes: z
    .array(
      z.object({
        component: z.string(),
        type: z.string(),
        before: z.any(),
        after: z.any(),
        reason: z.string().optional(),
      }),
    )
    .min(1, "At least one change is required"),
  performance_impact: z
    .object({
      score: z.number(),
      metrics: z.record(z.number()).optional(),
      analysis: z.string().optional(),
      bottlenecks: z.array(z.string()).optional(),
    })
    .optional()
    .transform((val) => val || { score: 0 }),
  dependencies: z
    .array(z.string())
    .optional()
    .transform((val) => val || []),
  validation_results: z
    .object({
      passed: z.boolean(),
      tests_run: z.number().optional(),
      tests_passed: z.number().optional(),
      coverage: z.number().optional(),
      issues: z.array(z.string()).optional(),
    })
    .optional()
    .transform((val) => val || { passed: false }),
  rollback_plan: z
    .object({
      available: z.boolean(),
      steps: z.array(z.string()).optional(),
      estimated_duration: z.number().optional(),
      risks: z.array(z.string()).optional(),
      dependencies: z.array(z.string()).optional(),
    })
    .optional()
    .transform((val) => val || { available: false }),
});
