import { router } from "../trpc";
import { dynamicPreferencesRouter } from "./dynamicPreferences";
import { languagesRouter } from "./languages";
import { settingsRouter } from "./settings";
import { genreLocalizationsRouter } from "./genreLocalizations";

export const appRouter = router({
  dynamicPreferences: dynamicPreferencesRouter,
  languages: languagesRouter,
  settings: settingsRouter,
  genreLocalizations: genreLocalizationsRouter,
});

export type AppRouter = typeof appRouter;
