# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build (uses --max-old-space-size=4096)
npm run preview      # Preview production build
npm run generate     # Static site generation
```

No test runner is configured. ESLint is set up via `@nuxt/eslint` — run with `npx eslint .`.

## Architecture

**Rimkirim** is a shipping/logistics web app built with Nuxt 4, Vue 3, PrimeVue 4, Tailwind CSS, and TypeScript.

### Request Flow

The Nuxt server (`server/api/`) acts as a **proxy layer** between the browser and the external backend. All server routes call the external API using `useRuntimeConfig().apiBaseUrl` (server-only env var). Auth uses httpOnly cookies — the server reads the `access_token` cookie and forwards it as a Bearer token to the backend.

Client-side API calls go to `/api/*` (Nuxt server routes), never directly to the backend.

### Pages & Routing

| Route | Description |
|---|---|
| `/` | Landing page |
| `/rates` | Shipping rate calculator |
| `/eligible` | Eligibility check flow |
| `/order-hub/[id]` | Multi-step order form (booking code as `id`) |
| `/auth/google`, `/auth/google/[id]` | Google OAuth flow |

### Order Hub Flow

The core feature. After booking, users complete 4 sequential steps tracked in `OrderHubProgress`:
1. `customer_information`
2. `item_and_package`
3. `compliance_document`
4. `pickup_detail_schedule`

Each step has a `ProgressStatus` of `awaiting_input | completed | locked`. The `useOrderHub` composable (`app/composables/useOrderHub.ts`) centralizes navigation, `fetchProgress`, and `handleSubmit` (PUT requests) for all order hub pages.

### Layouts

- `default` — Header + Footer + `ModalAuth` (used for most public pages)
- `order-hub` — Order hub specific chrome
- `eligible` — Eligibility flow
- `clean` — Minimal, no chrome

### Key Composables

- `useAuth` — Global user state via `useState('user')`. Called once in `app.vue` on boot via `fetchUser()`.
- `useAuthModal` — Controls the login/register modal (`isOpen`, `mode`).
- `useOrderHub` / `useDocumentUpload` — Order hub form logic and file uploads.
- `useGooglePlaces` — Google Places autocomplete for address fields.

### Styling

Design tokens are CSS variables in `app/assets/css/rimkirim-tokens.css` with the `--rimkirim-*` prefix (e.g. `--rimkirim-primary-main: #c1ff00`). PrimeVue is themed via a custom preset at `primevue/preset.ts` that maps these tokens to PrimeVue's semantic color system. Color mode is **forced to light** — dark mode is disabled.

Global CSS load order in `nuxt.config.ts`: `global.css` → `rimkirim-tokens.css` → `primevue-overrides.css`.

### Component Auto-import

Components in `app/components/` are auto-imported with `pathPrefix: false`, meaning `UIBrandLogo.vue` is used as `<UIBrandLogo />` (no folder prefix needed).

### Config Constants

`app/config/index.ts` exports `MENU` (route paths) and `ERROR_MESSAGE`. Import as `import { MENU } from '~/config'`.

### Environment Variables

| Variable | Used in |
|---|---|
| `API_BASE_URL` | Server-only; base URL for backend API calls |
| `NUXT_PUBLIC_API_BASE_URL` | Public; exposed to client |
| `NUXT_PUBLIC_BASE_URL` | Public; app base URL |
| `GOOGLE_MAPS_API_KEY` | Server + injected in HTML head |
| `GOOGLE_CLIENT_ID` | Server; Google OAuth |
