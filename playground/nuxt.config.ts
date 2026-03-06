export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },

  modules: ["@nuxt/ui", "../src/module"],
  css: ["~/assets/css/main.css"],
  playgroundUtils: {
    devtools: true,
  },

  compatibilityDate: "2024-08-21",
});
