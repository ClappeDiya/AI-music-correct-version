import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const genreLocalizationsRouter = router({
  getLocalizedGenre: publicProcedure
    .input(
      z.object({
        language: z.string(),
      }),
    )
    .query(async ({ input }) => {
      // TODO: Implement actual data fetching
      return [
        {
          id: "1",
          genre_id: "1",
          language: {
            code: input.language,
            name: "English",
          },
          localized_name: "Rock",
          localized_description: "A genre of popular music",
          source: "translation",
        },
      ];
    }),
});

export type GenreLocalizationsRouter = typeof genreLocalizationsRouter;
