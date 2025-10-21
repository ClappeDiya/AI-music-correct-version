export const locales = ["en", "fr", "es", "de", "zh"] as const;
export type Locale = (typeof locales)[number];
