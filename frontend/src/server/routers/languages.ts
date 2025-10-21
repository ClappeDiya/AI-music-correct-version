import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const languagesRouter = t.router({
  list: t.procedure.query(async () => {
    // Implementation will call Django API
    return [
      { id: "en", language_code: "en", language_name: "English" },
      { id: "fr", language_code: "fr", language_name: "French" },
      { id: "es", language_code: "es", language_name: "Spanish" },
    ];
  }),
  setLanguage: t.procedure
    .input(z.object({ language: z.string() }))
    .mutation(async ({ input }) => {
      // Implementation will call Django API to set user's language preference
      return { success: true };
    }),
});
