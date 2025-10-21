import * as z from "zod";

export const formSchema = z.object({
  layer_name: z.string().min(1, "Layer name is required"),
  layer_type: z.enum([
    "ontology",
    "taxonomy",
    "knowledge_graph",
    "semantic_network",
  ]),
  description: z.string().min(1, "Description is required"),
  complexity_level: z.enum(["basic", "intermediate", "advanced", "expert"]),
  access_mode: z.enum(["read_only", "write", "full_access"]),
  layer_schema: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  validation_rules: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  integration_points: z
    .array(z.string())
    .optional()
    .transform((val) => val || []),
});
