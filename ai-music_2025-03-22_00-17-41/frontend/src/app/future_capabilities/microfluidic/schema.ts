import * as z from "zod";

export const formSchema = z.object({
  instrument_name: z.string().min(1, "Instrument name is required"),
  instrument_type: z.enum([
    "droplet_generator",
    "flow_controller",
    "mixer",
    "separator",
    "analyzer",
    "custom",
  ]),
  status: z.enum(["online", "offline", "maintenance", "error"]),
  flow_configuration: z
    .record(z.any())
    .refine(
      (val) => Object.keys(val).length > 0,
      "Flow configuration is required",
    ),
  pressure_settings: z
    .object({
      pressure: z.number(),
      unit: z.string().default("kPa"),
      min: z.number(),
      max: z.number(),
    })
    .optional()
    .transform((val) => val || { pressure: 0, unit: "kPa", min: 0, max: 100 }),
  temperature_controls: z
    .object({
      target: z.number(),
      tolerance: z.number(),
      unit: z.string().default("C"),
    })
    .optional()
    .transform((val) => val || { target: 25, tolerance: 0.5, unit: "C" }),
  calibration_data: z
    .object({
      last_calibration: z.string().optional(),
      calibration_parameters: z.record(z.any()).optional(),
      validity_period: z.number().optional(),
    })
    .optional()
    .transform((val) => val || {}),
  maintenance_schedule: z
    .object({
      last_maintenance: z.string().optional(),
      next_maintenance: z.string().optional(),
      maintenance_interval: z.number().optional(),
      tasks: z.array(z.string()).optional(),
    })
    .optional()
    .transform((val) => val || {}),
  safety_protocols: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
});
