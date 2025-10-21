import * as z from "zod";

export const formSchema = z.object({
  mapping_name: z.string().min(1, "Mapping name is required"),
  mapping_type: z.enum([
    "sound_color",
    "color_sound",
    "motion_sound",
    "sound_texture",
    "emotion_sound",
    "custom",
  ]),
  status: z.enum(["active", "inactive", "testing", "archived"]),
  description: z.string().min(1, "Description is required"),
  input_modality: z
    .object({
      type: z.string(),
      parameters: z.record(z.any()).optional(),
      range: z.record(z.any()).optional(),
      preprocessing: z.array(z.string()).optional(),
    })
    .refine((val) => val.type.length > 0, "Input modality type is required"),
  output_modality: z
    .object({
      type: z.string(),
      parameters: z.record(z.any()).optional(),
      range: z.record(z.any()).optional(),
      postprocessing: z.array(z.string()).optional(),
    })
    .refine((val) => val.type.length > 0, "Output modality type is required"),
  mapping_rules: z
    .array(
      z.object({
        name: z.string(),
        condition: z.record(z.any()),
        transformation: z.record(z.any()),
        priority: z.number().optional(),
      }),
    )
    .min(1, "At least one mapping rule is required"),
  neural_correlates: z
    .object({
      regions: z.array(z.string()).optional(),
      pathways: z.array(z.string()).optional(),
      confidence: z.number().min(0).max(1).optional(),
      studies: z.array(z.string()).optional(),
    })
    .optional()
    .transform((val) => val || {}),
  validation_metrics: z
    .object({
      score: z.number().min(0).max(1).optional(),
      consistency: z.number().optional(),
      user_feedback: z.record(z.any()).optional(),
      test_cases: z.array(z.any()).optional(),
      last_validated: z.string().optional(),
    })
    .optional()
    .transform((val) => val || {}),
});
