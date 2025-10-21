import * as z from "zod";

export const formSchema = z.object({
  device_name: z.string().min(1, "Device name is required"),
  device_type: z.enum([
    "midi_controller",
    "audio_interface",
    "vr_controller",
    "motion_sensor",
    "biometric_sensor",
    "custom",
  ]),
  connection_type: z.enum(["usb", "bluetooth", "wifi", "serial", "network"]),
  status: z.enum(["connected", "disconnected", "error", "pairing"]),
  configuration: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  mapping_rules: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  calibration_data: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
  permissions: z
    .record(z.any())
    .optional()
    .transform((val) => val || {}),
});
