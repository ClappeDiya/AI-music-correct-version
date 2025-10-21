import * as z from "zod";

export const formSchema = z.object({
  config_name: z.string().min(1, "Configuration name is required"),
  config_type: z.enum([
    "deep_space",
    "planetary",
    "orbital",
    "quantum",
    "hybrid",
  ]),
  status: z.enum(["active", "inactive", "testing", "optimizing"]),
  description: z.string().min(1, "Description is required"),
  latency_parameters: z
    .object({
      baseline: z.number(),
      variance: z.number().optional(),
      max_acceptable: z.number().optional(),
      compensation_threshold: z.number().optional(),
      measurement_interval: z.number().optional(),
    })
    .refine(
      (val) => val.baseline >= 0,
      "Baseline latency must be non-negative",
    ),
  compensation_strategies: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        parameters: z.record(z.any()),
        priority: z.number().optional(),
      }),
    )
    .optional()
    .transform((val) => val || []),
  routing_protocols: z
    .array(
      z.object({
        protocol: z.string(),
        version: z.string(),
        settings: z.record(z.any()),
        fallback: z.string().optional(),
      }),
    )
    .optional()
    .transform((val) => val || []),
  quantum_entanglement: z
    .object({
      enabled: z.boolean(),
      pairs: z.number().optional(),
      stability: z.number().optional(),
      coherence_time: z.number().optional(),
      error_rate: z.number().optional(),
    })
    .optional()
    .transform((val) => val || { enabled: false }),
  performance_metrics: z
    .object({
      efficiency: z.number().min(0).max(1).optional(),
      throughput: z.number().optional(),
      error_rate: z.number().optional(),
      jitter: z.number().optional(),
      packet_loss: z.number().optional(),
    })
    .optional()
    .transform((val) => val || {}),
});
