import * as z from "zod";

export const formSchema = z.object({
  model_name: z.string().min(1, "Model name is required"),
  model_type: z.enum(["pca", "tsne", "umap", "autoencoder", "custom"]),
  status: z.enum(["active", "training", "failed", "archived"]),
  description: z.string().min(1, "Description is required"),
  input_dimensions: z
    .object({
      count: z.number(),
      names: z.array(z.string()).optional(),
      ranges: z.record(z.any()).optional(),
    })
    .refine((val) => val.count > 0, "Input dimensions must be greater than 0"),
  output_dimensions: z
    .object({
      count: z.number(),
      names: z.array(z.string()).optional(),
      ranges: z.record(z.any()).optional(),
    })
    .refine(
      (val) => val.count > 0 && val.count < 4,
      "Output dimensions must be between 1 and 3",
    ),
  model_parameters: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  training_metrics: z
    .object({
      accuracy: z.number().optional(),
      loss: z.number().optional(),
      epochs: z.number().optional(),
      training_time: z.number().optional(),
      learning_rate: z.number().optional(),
    })
    .optional()
    .transform((val) => val || {}),
  validation_results: z
    .object({
      validated: z.boolean().optional(),
      passed: z.boolean().optional(),
      metrics: z.record(z.any()).optional(),
      timestamp: z.string().optional(),
    })
    .optional()
    .transform((val) => val || { validated: false }),
});
