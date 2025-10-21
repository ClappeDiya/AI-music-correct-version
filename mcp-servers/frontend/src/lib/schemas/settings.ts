import * as z from "zod";

export const generalSettingsSchema = z.object({
  appName: z.string().min(2).max(50),
  currency: z.string().min(3).max(3),
  timezone: z.string(),
  language: z.string(),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  sensoryProfile: z.object({
    colorScheme: z.string(),
    contrastLevel: z.number().min(1).max(5),
    motionReduction: z.boolean(),
    soundEffects: z.boolean(),
  }),
  accessibility: z.object({
    fontSize: z.number().min(12).max(24),
    screenReader: z.boolean(),
    keyboardNavigation: z.boolean(),
  }),
});

export const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean(),
  loginNotifications: z.boolean(),
  trustedDevices: z.array(
    z.object({
      deviceId: z.string(),
      deviceName: z.string(),
      lastUsed: z.string(),
    }),
  ),
});

export const notificationSettingsSchema = z.object({
  email: z.object({
    updates: z.boolean(),
    security: z.boolean(),
    marketing: z.boolean(),
  }),
  push: z.object({
    enabled: z.boolean(),
    quiet_hours: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
  }),
});

export type GeneralSettingsForm = z.infer<typeof generalSettingsSchema>;
export type UserPreferencesForm = z.infer<typeof userPreferencesSchema>;
export type SecuritySettingsForm = z.infer<typeof securitySettingsSchema>;
export type NotificationSettingsForm = z.infer<
  typeof notificationSettingsSchema
>;
