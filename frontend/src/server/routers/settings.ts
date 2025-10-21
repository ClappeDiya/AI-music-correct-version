import { router, procedure } from "../trpc";
import { z } from "zod";

export const settingsRouter = router({
  profiles: router({
    list: procedure.query(async () => {
      // Implementation will call Django API
      return [];
    }),
    activate: procedure.input(z.string()).mutation(async ({ input }) => {
      // Implementation will call Django API
      return { success: true };
    }),
    duplicate: procedure.input(z.string()).mutation(async ({ input }) => {
      // Implementation will call Django API
      return { success: true };
    }),
  }),
  dynamicPreferences: router({
    list: procedure.query(async () => {
      // Implementation will call Django API
      return [];
    }),
    update: procedure.input(z.record(z.any())).mutation(async ({ input }) => {
      // Implementation will call Django API
      return input;
    }),
    getCurrency: procedure.query(async () => {
      // Default to USD if not set
      return "USD";
    }),
    setCurrency: procedure.input(z.string()).mutation(async ({ input }) => {
      // Implementation will call Django API
      return { currency: input };
    }),
  }),
  profileFusions: router({
    list: procedure.query(async () => {
      // Implementation will call Django API
      return [];
    }),
    create: procedure
      .input(
        z.object({
          profileId: z.string(),
          fusionType: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        // Implementation will call Django API
        return input;
      }),
  }),
});
