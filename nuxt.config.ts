// https://nuxt.com/docs/api/configuration/nuxt-config
import RimkirimPreset from "./primevue/preset";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  runtimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL, // server-only
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      apiBaseUrl: process.env.API_BASE_URL,
    },
  },

  devtools: { enabled: true },

  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@primevue/nuxt-module",
  ],

  primevue: {
    options: {
      theme: {
        preset: RimkirimPreset,
      },
    },
  },

  app: {
    head: {
      title: "Rimkirim",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      script: [
        {
          src: `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`,
          async: true,
          defer: true,
        },
      ],
    },
  },

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  css: [
    "/assets/css/global.css",
    "/assets/css/rimkirim-tokens.css",
    "/assets/css/primevue-overrides.css",
  ],

  colorMode: {
    preference: "light", // force light
    fallback: "light",
    classSuffix: "",
  },

  vite: {
    server: {
      allowedHosts: ["rimkirimdev.com"],
    },
  },
});
