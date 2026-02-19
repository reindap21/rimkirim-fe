/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Prompt', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: 'var(--rimkirim-primary-main)',

        neutral: {
          10: 'var(--rimkirim-neutral-10)',
          20: 'var(--rimkirim-neutral-20)',
          30: 'var(--rimkirim-neutral-30)',
          40: 'var(--rimkirim-neutral-40)',
          60: 'var(--rimkirim-neutral-60)',
          70: 'var(--rimkirim-neutral-70)',
          80: 'var(--rimkirim-neutral-80)',
          90: 'var(--rimkirim-neutral-90)',
          100: 'var(--rimkirim-neutral-100)',
        },

        success: 'var(--rimkirim-semantic-success)',
        danger: 'var(--rimkirim-semantic-danger)',
        warning: 'var(--rimkirim-semantic-warning)',
        info: 'var(--rimkirim-semantic-info)',
      },
    },
  },
  plugins: [],
}
