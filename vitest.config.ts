import { defineVitestConfig } from '@nuxt/test-utils/config'
import { resolve } from 'path'

export default defineVitestConfig({
  resolve: {
    alias: {
      // Nuxt 4 serves app/assets at /assets — remap for test env
      '/assets': resolve(__dirname, 'app/assets'),
    },
  },
  test: {
    hookTimeout: 30000,
    environment: 'nuxt',
    environmentOptions: {
      nuxt: { domEnvironment: 'happy-dom' },
    },
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'app/utils/string.ts',
        'app/utils/address.ts',
        'app/utils/misc.ts',
        'app/utils/order-hub.ts',
        'app/composables/useAuthModal.ts',
        'app/composables/useAuth.ts',
      ],
      all: true,
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
        perFile: true,
      },
      reporter: ['text', 'html', 'lcov'],
    },
  },
})
