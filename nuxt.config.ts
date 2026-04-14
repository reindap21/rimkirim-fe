// https://nuxt.com/docs/api/configuration/nuxt-config
import RimkirimPreset from "./primevue/preset";

const isDev = process.env.NUXT_PUBLIC_APP_ENV !== "production";

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

  devtools: { enabled: isDev },

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
      htmlAttrs: {
        style: "color-scheme: light;",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "color-scheme", content: "light" },
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
    "~/assets/css/global.css",
    "~/assets/css/rimkirim-tokens.css",
    "~/assets/css/primevue-overrides.css",
  ],

  colorMode: {
    preference: "light",
    fallback: "light",
    classSuffix: "",
  },

  ...(isDev && {
    vite: {
      server: {
        allowedHosts: [
          "rimkirimdev.com",
          ".trycloudflare.com",
          ".ngrok-free.app",
          ".ngrok-free.dev",
          ".ngrok.io",
        ],
        hmr: {
          clientPort: 443,
          protocol: "wss",
        },
      },
    },
  }),
});
