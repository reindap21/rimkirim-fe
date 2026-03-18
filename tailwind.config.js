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
        'primary-hover': 'var(--rimkirim-primary-hover)',

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
        'neutral-gray': 'var(--rimkirim-neutral-gray)',

        purple: 'var(--rimkirim-purple)',
        teal: 'var(--rimkirim-teal)',
        'teal-light': 'var(--rimkirim-teal-light)',

        success: 'var(--rimkirim-semantic-success)',
        danger: 'var(--rimkirim-semantic-danger)',
        warning: 'var(--rimkirim-semantic-warning)',
        info: 'var(--rimkirim-semantic-info)',
      },
      fontSize: {
        'body-sm':    ['14px', { lineHeight: '22px' }],
        'body':       ['16px', { lineHeight: '24px' }],
        'body-lg':    ['18px', { lineHeight: '26px' }],
        'heading-sm': ['24px', { lineHeight: '32px' }],
        'heading':    ['32px', { lineHeight: '40px' }],
        'display-sm': ['40px', { lineHeight: '48px' }],
        'display':    ['52px', { lineHeight: '60px' }],
      },
    },
  },
  plugins: [],
}
