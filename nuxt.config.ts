// https://nuxt.com/docs/api/configuration/nuxt-config

import RimkirimPreset from './primevue/preset'

export default defineNuxtConfig({
  runtimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL, // server-only
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL
    }
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxtjs/tailwindcss",
    "@primevue/nuxt-module",
  ],
  primevue: {
    options: {
      theme: {
        preset: RimkirimPreset
      }
    }
  },
  app: {
    head: {
      title: "Rimkirim",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  css: ["/assets/css/global.css"],
});
