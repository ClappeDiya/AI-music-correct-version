import * as z from "zod";

export const formSchema = z.object({
  plugin_name: z.string().min(1, "Plugin name is required"),
  plugin_description: z.string().min(1, "Description is required"),
  version: z.string().min(1, "Version is required"),
  plugin_config: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  access_level: z.enum(["public", "private", "restricted"]),
  approved: z.enum(["true", "false"]).transform((val) => val === "true"),
});
