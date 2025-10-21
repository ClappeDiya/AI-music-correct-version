module.exports = {
  locales: ["en", "fr", "es", "de", "zh"],
  defaultLocale: "en",
  pages: {
    "*": ["common"],
    "/settings": ["settings"],
    "/translations": ["translations"],
  },
  loadLocaleFrom: (lang, ns) =>
    import(`./src/locales/${lang}/${ns}.json`).then((m) => m.default),
};
