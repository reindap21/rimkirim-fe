// https://nuxt.com/docs/api/configuration/nuxt-config
<<<<<<< HEAD
import RimkirimPreset from "./primevue/preset";
=======
import RimkirimPreset from './primevue/preset'
>>>>>>> Refactor page structure; Page customer infor and item & packages

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  runtimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL, // server-only
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
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
<<<<<<< HEAD
        preset: RimkirimPreset,
      },
    },
  },

=======
        preset: RimkirimPreset
      }
    }
  },


>>>>>>> Refactor page structure; Page customer infor and item & packages
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
<<<<<<< HEAD
          defer: true,
        },
      ],
=======
          defer: true
        }
      ]
>>>>>>> Refactor page structure; Page customer infor and item & packages
    },
  },

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  css: [
<<<<<<< HEAD
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
=======
    "/assets/css/global.css"
  ],

  vite: {
    server: {
      allowedHosts: ['rimkirimdev.com']
    }
  }
})
>>>>>>> Refactor page structure; Page customer infor and item & packages
